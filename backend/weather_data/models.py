from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class WeatherRecord(models.Model):

    class Source(models.TextChoices):
        OPENWEATHER = "OPENWEATHER", "OpenWeather"
        OPEN_METEO = "OPEN_METEO", "Open-Meteo"
        MANUAL = "MANUAL", "Manual"
        DATASET = "DATASET", "Dataset"

    class Status(models.TextChoices):
        SYNCED = "SYNCED", "Synced"
        PENDING = "PENDING", "Pending"
        FAILED = "FAILED", "Failed"

    location = models.CharField(
        max_length=200,
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    recorded_at = models.DateTimeField()

    temperature = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    feels_like = models.DecimalField(
        max_digits=5,
        decimal_places=2,
    )

    humidity = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    uv_index = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
        ],
    )

    wind_speed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
        ],
        help_text="Wind speed in kilometres per hour.",
    )

    condition = models.CharField(
        max_length=100,
        blank=True,
    )

    source = models.CharField(
        max_length=20,
        choices=Source.choices,
        default=Source.OPENWEATHER,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SYNCED,
    )

    external_reference = models.CharField(
        max_length=200,
        blank=True,
    )

    raw_data = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-recorded_at"]

        indexes = [
            models.Index(
                fields=["location", "recorded_at"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.location} - "
            f"{self.recorded_at:%Y-%m-%d %H:%M}"
        )