from rest_framework import serializers

from .models import WeatherRecord


class WeatherRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherRecord

        fields = [
            "id",
            "location",
            "latitude",
            "longitude",
            "recorded_at",
            "temperature",
            "feels_like",
            "humidity",
            "uv_index",
            "wind_speed",
            "condition",
            "source",
            "status",
            "created_at",
        ]