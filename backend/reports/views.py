from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from activities.models import PlannedActivity
from risk_engine.models import RiskAssessment
from risk_engine.serializers import RiskAssessmentSerializer

from django.db.models import Avg, Count
from django.db.models.functions import TruncDate



class DashboardReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        assessments = RiskAssessment.objects.select_related(
            "activity",
            "activity__activity_type",
        )

        activities = PlannedActivity.objects.all()

        if user.role == "SUPERVISOR":
            assessments = assessments.filter(
                activity__supervisor=user
            )

            activities = activities.filter(
                supervisor=user
            )

        today_assessments = assessments.filter(
            created_at__date=today
        )

        today_stats = today_assessments.aggregate(
            average_risk=Avg("risk_score"),

            low_risk=Count(
                "id",
                filter=Q(risk_level="LOW"),
            ),

            moderate_risk=Count(
                "id",
                filter=Q(risk_level="MODERATE"),
            ),

            high_risk=Count(
                "id",
                filter=Q(risk_level="HIGH"),
            ),

            very_high_risk=Count(
                "id",
                filter=Q(risk_level="VERY_HIGH"),
            ),
        )

        all_time_stats = assessments.aggregate(
            average_risk=Avg("risk_score"),

            low_risk=Count(
                "id",
                filter=Q(risk_level="LOW"),
            ),

            moderate_risk=Count(
                "id",
                filter=Q(risk_level="MODERATE"),
            ),

            high_risk=Count(
                "id",
                filter=Q(risk_level="HIGH"),
            ),

            very_high_risk=Count(
                "id",
                filter=Q(risk_level="VERY_HIGH"),
            ),
        )

        rescheduled_activities = activities.filter(
            status=PlannedActivity.Status.RESCHEDULED
        ).count()

        recent_assessments = assessments.order_by(
            "-created_at"
        )[:5]

        return Response(
            {
                "today": {
                    "total_assessments": today_assessments.count(),

                    "low_risk": today_stats["low_risk"],

                    "moderate_risk": today_stats[
                        "moderate_risk"
                    ],

                    "high_risk": today_stats["high_risk"],

                    "very_high_risk": today_stats[
                        "very_high_risk"
                    ],

                    "average_risk": (
                        round(
                            float(
                                today_stats["average_risk"]
                            ),
                            2,
                        )
                        if today_stats["average_risk"]
                        is not None
                        else 0
                    ),
                },

                "overall": {
                    "total_assessments": assessments.count(),

                    "low_risk": all_time_stats["low_risk"],

                    "moderate_risk": all_time_stats[
                        "moderate_risk"
                    ],

                    "high_risk": all_time_stats[
                        "high_risk"
                    ],

                    "very_high_risk": all_time_stats[
                        "very_high_risk"
                    ],

                    "average_risk": (
                        round(
                            float(
                                all_time_stats["average_risk"]
                            ),
                            2,
                        )
                        if all_time_stats["average_risk"]
                        is not None
                        else 0
                    ),
                },

                "rescheduled_activities":
                    rescheduled_activities,

                "recent_assessments":
                    RiskAssessmentSerializer(
                        recent_assessments,
                        many=True,
                        context={
                            "request": request,
                        },
                    ).data,
            }
        )
        
class RiskTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        assessments = RiskAssessment.objects.select_related(
            "activity"
        )

        if user.role == "SUPERVISOR":
            assessments = assessments.filter(
                activity__supervisor=user
            )

        trend_data = (
            assessments
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                average_risk=Avg("risk_score"),
                total_assessments=Count("id"),
            )
            .order_by("date")
        )

        results = []

        for item in trend_data:
            results.append(
                {
                    "date": item["date"],
                    "average_risk": round(
                        float(item["average_risk"]),
                        2,
                    ),
                    "total_assessments":
                        item["total_assessments"],
                }
            )

        return Response(results)
    
class RiskDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assessments = RiskAssessment.objects.all()

        if request.user.role == "SUPERVISOR":
            assessments = assessments.filter(
                activity__supervisor=request.user
            )

        distribution = {
            "LOW": assessments.filter(
                risk_level="LOW"
            ).count(),

            "MODERATE": assessments.filter(
                risk_level="MODERATE"
            ).count(),

            "HIGH": assessments.filter(
                risk_level="HIGH"
            ).count(),

            "VERY_HIGH": assessments.filter(
                risk_level="VERY_HIGH"
            ).count(),
        }

        return Response(distribution)