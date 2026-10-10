from rest_framework import serializers

from risk_engine.models import RiskAssessment

from .models import ActivityType, PlannedActivity


class ActivityTypeSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = ActivityType
        fields = [
            "id",
            "name",
            "intensity",
            "default_exposure",
            "default_duration",
            "is_active",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_at",
            "updated_at",
        ]

    def get_status(self, obj):
        return "ACTIVE" if obj.is_active else "INACTIVE"


class LatestRiskAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskAssessment
        fields = [
            "id",
            "risk_score",
            "risk_level",
            "assessment_method",
            "recommendation",
            "safer_start_time",
            "safer_end_time",
            "alternative_start_time",
            "alternative_end_time",
            "created_at",
        ]


class PlannedActivitySerializer(serializers.ModelSerializer):
    supervisor = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    supervisor_name = serializers.SerializerMethodField()

    activity_type_name = serializers.CharField(
        source="activity_type.name",
        read_only=True,
    )

    activity_intensity = serializers.CharField(
        source="activity_type.intensity",
        read_only=True,
    )

    latest_assessment = serializers.SerializerMethodField()

    class Meta:
        model = PlannedActivity
        fields = [
            "id",
            "supervisor",
            "supervisor_name",
            "activity_type",
            "activity_type_name",
            "activity_intensity",
            "location",
            "latitude",
            "longitude",
            "activity_date",
            "start_time",
            "duration_hours",
            "sun_exposure",
            "water_available",
            "rest_area_available",
            "worker_category",
            "notes",
            "status",
            "original_start_time",
            "latest_assessment",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "supervisor",
            "status",
            "original_start_time",
            "created_at",
            "updated_at",
        ]

    def get_supervisor_name(self, obj):
        full_name = obj.supervisor.get_full_name()

        if full_name:
            return full_name

        return obj.supervisor.email

    def get_latest_assessment(self, obj):
        assessment = obj.assessments.first()

        if assessment is None:
            return None

        return LatestRiskAssessmentSerializer(
            assessment
        ).data


class RescheduleActivitySerializer(serializers.Serializer):
    start_time = serializers.TimeField()