from rest_framework import serializers

from .models import RiskAssessment, RiskRule


class RiskAssessmentInputSerializer(serializers.Serializer):
    temperature = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    feels_like = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    humidity = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=100,
    )

    uv_index = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        min_value=0,
    )

    wind_speed = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        required=False,
        default=0,
    )


class RiskRuleSerializer(serializers.ModelSerializer):
    total_weight = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = RiskRule
        fields = [
            "id",
            "name",
            "low_max",
            "moderate_max",
            "high_max",
            "very_high_min",
            "temperature_weight",
            "humidity_weight",
            "uv_weight",
            "activity_weight",
            "duration_weight",
            "use_feels_like",
            "consider_sun_exposure",
            "consider_water_availability",
            "consider_rest_area",
            "is_active",
            "total_weight",
            "created_at",
            "updated_at",
        ]


class RiskAssessmentSerializer(serializers.ModelSerializer):
    activity_name = serializers.CharField(
        source="activity.activity_type.name",
        read_only=True,
    )

    activity_location = serializers.CharField(
        source="activity.location",
        read_only=True,
    )

    class Meta:
        model = RiskAssessment
        fields = [
            "id",
            "activity",
            "activity_name",
            "activity_location",
            "weather_record",
            "risk_rule",
            "temperature",
            "feels_like",
            "humidity",
            "uv_index",
            "wind_speed",
            "temperature_score",
            "humidity_score",
            "uv_score",
            "activity_score",
            "duration_score",
            "risk_score",
            "risk_level",
            "assessment_method",
            "recommendation",
            "explanation",
            "safer_start_time",
            "safer_end_time",
            "alternative_start_time",
            "alternative_end_time",
            "created_at",
        ]

        read_only_fields = fields