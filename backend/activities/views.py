from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from risk_engine.models import RiskAssessment
from risk_engine.serializers import RiskAssessmentSerializer
from risk_engine.services.risk_calculator import calculate_risk
from ml.inference import predict_weather_at
from ml.risk_inference import (
    predict_risk_level,
    is_available as rf_available,
)
from weather_data.services.open_meteo import (
    WeatherServiceError,
    fetch_weather_for_activity,
)

from .models import ActivityType, PlannedActivity
from .permissions import IsAdministrator, IsSupervisor
from .serializers import (
    ActivityTypeSerializer,
    PlannedActivitySerializer,
    RescheduleActivitySerializer,
)

from weather_data.services.safer_times import (
    SaferTimeServiceError,
    get_safer_time_slots,
)

class ActivityTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ActivityType.objects.all()

        if self.request.user.role == "SUPERVISOR":
            return queryset.filter(is_active=True)

        return queryset

    def get_permissions(self):
        admin_actions = [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]

        if self.action in admin_actions:
            return [
                IsAuthenticated(),
                IsAdministrator(),
            ]

        return [IsAuthenticated()]


class PlannedActivityViewSet(viewsets.ModelViewSet):
    serializer_class = PlannedActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            PlannedActivity.objects
            .select_related(
                "supervisor",
                "activity_type",
            )
            .prefetch_related("assessments")
        )

        user = self.request.user

        if user.role == "ADMINISTRATOR":
            return queryset

        return queryset.filter(supervisor=user)

    def get_permissions(self):
        supervisor_actions = [
            "create",
            "update",
            "partial_update",
            "destroy",
            "reschedule",
            "assess",
        ]

        if self.action in supervisor_actions:
            return [
                IsAuthenticated(),
                IsSupervisor(),
            ]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(
            supervisor=self.request.user,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="assess-dl",
    )
    @transaction.atomic
    def assess_dl(self, request, pk=None):
        """
        Deep Learning based risk assessment.

        Uses the DeepSafe-Heat LSTM to predict weather conditions at the
        activity's planned start time, then runs the same rule-based
        risk engine on those predicted values.
        """
        from datetime import datetime, timedelta
        from django.utils import timezone
        from weather_data.models import WeatherRecord

        activity = self.get_object()

        if activity.latitude is None or activity.longitude is None:
            return Response(
                {"detail": "Activity must have latitude and longitude."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build the target datetime from activity_date + start_time
        target_dt = datetime.combine(
            activity.activity_date,
            activity.start_time,
        )
        if timezone.is_naive(target_dt):
            target_dt = timezone.make_aware(
                target_dt,
                timezone.get_current_timezone(),
            )

        # If the activity is more than 12h ahead, clamp to 12h (model horizon)
        now = timezone.localtime()
        if target_dt <= now:
            target_dt = now + timedelta(hours=1)
        elif (target_dt - now).total_seconds() > 12 * 3600:
            target_dt = now + timedelta(hours=12)

        try:
            prediction = predict_weather_at(
                lat=float(activity.latitude),
                lon=float(activity.longitude),
                target_time=target_dt.replace(tzinfo=None),
            )
        except Exception as error:
            return Response(
                {"detail": f"Deep learning prediction failed: {error}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Run the same rule-based engine on predicted values
        try:
            assessment_data = calculate_risk(
                activity=activity,
                temperature=prediction["temperature"],
                feels_like=prediction["feels_like"],
                humidity=prediction["humidity"],
                uv_index=prediction["uv_index"],
                wind_speed=prediction["wind_speed"],
            )
        except ValueError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save a WeatherRecord so the assessment FK is happy.
        # WeatherRecord is standalone (no activity FK) — it stores the
        # predicted conditions at the location + time.
        weather_record = WeatherRecord.objects.create(
            location=activity.location or f"{activity.latitude},{activity.longitude}",
            latitude=activity.latitude,
            longitude=activity.longitude,
            recorded_at=target_dt,
            temperature=prediction["temperature"],
            feels_like=prediction["feels_like"],
            humidity=prediction["humidity"],
            uv_index=prediction["uv_index"],
            wind_speed=prediction["wind_speed"],
            source="DEEP_LEARNING",
        )

        # Tag the assessment as deep-learning driven
        assessment_data["assessment_method"] = "DEEP_LEARNING"

        assessment = RiskAssessment.objects.create(
            activity=activity,
            weather_record=weather_record,
            **assessment_data,
        )

        activity.status = PlannedActivity.Status.ASSESSED
        activity.save(update_fields=["status", "updated_at"])

        serializer = RiskAssessmentSerializer(assessment)
        data = serializer.data
        data["source"] = "deep_learning"
        data["forecast_time"] = prediction["forecast_time"]
        data["hours_ahead"] = prediction["hours_ahead"]
        return Response(data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        url_path="assess",
    )
    @transaction.atomic
    def assess(self, request, pk=None):
        """
        Assess heat risk using DeepSafe-Heat LSTM forecast.

        Weather conditions are predicted 1..12 hours ahead by the trained
        LSTM; the rule engine then converts those predictions into a risk
        level using worker safety thresholds.
        """
        from datetime import datetime, timedelta
        from django.utils import timezone
        from weather_data.models import WeatherRecord

        activity = self.get_object()

        if activity.latitude is None or activity.longitude is None:
            return Response(
                {"detail": "Activity must have latitude and longitude."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_dt = datetime.combine(
            activity.activity_date,
            activity.start_time,
        )
        if timezone.is_naive(target_dt):
            target_dt = timezone.make_aware(
                target_dt,
                timezone.get_current_timezone(),
            )

        now = timezone.localtime()
        if target_dt <= now:
            target_dt = now + timedelta(hours=1)
        elif (target_dt - now).total_seconds() > 12 * 3600:
            target_dt = now + timedelta(hours=12)

        prediction = None
        try:
            # Primary path: Deep Learning forecast
            prediction = predict_weather_at(
                lat=float(activity.latitude),
                lon=float(activity.longitude),
                target_time=target_dt.replace(tzinfo=None),
            )
            weather_record = WeatherRecord.objects.create(
                location=activity.location or f"{activity.latitude},{activity.longitude}",
                latitude=activity.latitude,
                longitude=activity.longitude,
                recorded_at=target_dt,
                temperature=prediction["temperature"],
                feels_like=prediction["feels_like"],
                humidity=prediction["humidity"],
                uv_index=prediction["uv_index"],
                wind_speed=prediction["wind_speed"],
                source="DEEP_LEARNING",
            )
        except Exception as dl_error:
            # Fallback: Open-Meteo (keeps the app running if model fails)
            try:
                weather_record = fetch_weather_for_activity(activity)
            except WeatherServiceError as error:
                return Response(
                    {"detail": f"DL failed ({dl_error}); fallback also failed: {error}"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        try:
            assessment_data = calculate_risk(
                activity=activity,
                temperature=weather_record.temperature,
                feels_like=weather_record.feels_like,
                humidity=weather_record.humidity,
                uv_index=weather_record.uv_index,
                wind_speed=weather_record.wind_speed,
            )
            assessment_data["assessment_method"] = (
                "DEEP_LEARNING" if prediction else "RULE_BASED"
            )

            # ---- Random Forest classification override ----
            # Rules produce the score/explanation/recommendation.
            # The RF learns the final risk level from data.
            rf_meta = None
            try:
                if rf_available():
                    rf_result = predict_risk_level(
                        temperature=float(weather_record.temperature),
                        humidity=float(weather_record.humidity),
                        wind_speed=float(weather_record.wind_speed),
                        uv_index=float(weather_record.uv_index),
                        intensity=activity.activity_type.intensity,
                        duration=float(activity.duration_hours),
                    )
                    assessment_data["risk_level"] = rf_result["level"]
                    assessment_data["assessment_method"] = "DEEP_LEARNING_RF"
                    rf_meta = {
                        "confidence": rf_result["confidence"],
                        "probabilities": rf_result["probabilities"],
                    }
            except Exception as rf_exc:
                import traceback, sys
                print(f"[RF] FAILED: {type(rf_exc).__name__}: {rf_exc}", file=sys.stderr)
                traceback.print_exc()

        except WeatherServiceError as error:
            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except ValueError as error:
            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        assessment = RiskAssessment.objects.create(
            activity=activity,
            weather_record=weather_record,
            **assessment_data,
        )

        activity.status = PlannedActivity.Status.ASSESSED

        activity.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        refreshed_activity = (
            PlannedActivity.objects
            .select_related(
                "supervisor",
                "activity_type",
            )
            .prefetch_related("assessments")
            .get(pk=activity.pk)
        )

        response_payload = {
            "activity": PlannedActivitySerializer(
                refreshed_activity,
                context={"request": request},
            ).data,
            "weather": {
                "id": weather_record.id,
                "location": weather_record.location,
                "recorded_at": weather_record.recorded_at,
                "temperature": weather_record.temperature,
                "feels_like": weather_record.feels_like,
                "humidity": weather_record.humidity,
                "uv_index": weather_record.uv_index,
                "wind_speed": weather_record.wind_speed,
                "condition": weather_record.condition,
                "source": weather_record.source,
                "status": weather_record.status,
            },
            "assessment": RiskAssessmentSerializer(
                assessment,
                context={"request": request},
            ).data,
        }

        # Attach Random Forest metadata if available
        try:
            if rf_meta:
                response_payload["assessment"]["rf_confidence"] = rf_meta["confidence"]
                response_payload["assessment"]["rf_probabilities"] = rf_meta["probabilities"]
        except NameError:
            pass

        return Response(
            response_payload,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="reschedule",
    )
    @transaction.atomic
    def reschedule(self, request, pk=None):
        activity = self.get_object()

        serializer = RescheduleActivitySerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        new_start_time = serializer.validated_data[
            "start_time"
        ]

        if activity.original_start_time is None:
            activity.original_start_time = (
                activity.start_time
            )

        activity.start_time = new_start_time
        activity.status = PlannedActivity.Status.RESCHEDULED

        activity.save(
            update_fields=[
                "original_start_time",
                "start_time",
                "status",
                "updated_at",
            ]
        )

        return Response(
            PlannedActivitySerializer(
                activity,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )
        
    @action(
    detail=True,
    methods=["get"],
    url_path="safer-times",
    )
    def safer_times(self, request, pk=None):
        activity = self.get_object()

        try:
            slots = get_safer_time_slots(
                activity
            )

        except SaferTimeServiceError as error:
            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except ValueError as error:
            return Response(
                {
                    "detail": str(error),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "activity": {
                    "id": activity.id,
                    "activity_type":
                        activity.activity_type.name,
                    "location":
                        activity.location,
                    "activity_date":
                        activity.activity_date,
                    "start_time":
                        activity.start_time,
                    "duration_hours":
                        activity.duration_hours,
                },

                "slots": slots,
            },
            status=status.HTTP_200_OK,
        )