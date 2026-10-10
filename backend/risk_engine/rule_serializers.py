from rest_framework import serializers

from .models import RiskRule


class RiskRuleSerializer(serializers.ModelSerializer):
    total_weight = serializers.IntegerField(
        read_only=True
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

        read_only_fields = [
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        weights = [
            attrs.get(
                "temperature_weight",
                getattr(
                    self.instance,
                    "temperature_weight",
                    35,
                ),
            ),
            attrs.get(
                "humidity_weight",
                getattr(
                    self.instance,
                    "humidity_weight",
                    20,
                ),
            ),
            attrs.get(
                "uv_weight",
                getattr(
                    self.instance,
                    "uv_weight",
                    20,
                ),
            ),
            attrs.get(
                "activity_weight",
                getattr(
                    self.instance,
                    "activity_weight",
                    15,
                ),
            ),
            attrs.get(
                "duration_weight",
                getattr(
                    self.instance,
                    "duration_weight",
                    10,
                ),
            ),
        ]

        if sum(weights) != 100:
            raise serializers.ValidationError(
                "Risk weights must total 100%."
            )

        return attrs