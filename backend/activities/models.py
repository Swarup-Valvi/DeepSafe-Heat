from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class ActivityType(models.Model):
    class Intensity(models.TextChoices):
        LOW = "LOW", "Low"
        MODERATE = "MODERATE", "Moderate"
        HIGH = "HIGH", "High"

    class Exposure(models.TextChoices):
        DIRECT = "DIRECT", "Direct sunlight"
        MIXED = "MIXED", "Mixed exposure"
        SHADED = "SHADED", "Shaded"

    name = models.CharField(
        max_length=120,
        unique=True,
    )

    intensity = models.CharField(
        max_length=20,
        choices=Intensity.choices,
        default=Intensity.MODERATE,
    )

    default_exposure = models.CharField(
        max_length=20,
        choices=Exposure.choices,
        default=Exposure.DIRECT,
    )

    default_duration = models.PositiveIntegerField(
        default=1,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12),
        ],
        help_text="Default duration in hours.",
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PlannedActivity(models.Model):
    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        ASSESSED = "ASSESSED", "Assessed"
        RESCHEDULED = "RESCHEDULED", "Rescheduled"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    class SunExposure(models.TextChoices):
        DIRECT = "DIRECT", "Direct sunlight"
        MIXED = "MIXED", "Mixed exposure"
        SHADED = "SHADED", "Shaded"

    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="planned_activities",
    )

    activity_type = models.ForeignKey(
        ActivityType,
        on_delete=models.PROTECT,
        related_name="planned_activities",
    )

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

    activity_date = models.DateField()

    start_time = models.TimeField()

    duration_hours = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[
            MinValueValidator(0.5),
            MaxValueValidator(24),
        ],
    )

    sun_exposure = models.CharField(
        max_length=20,
        choices=SunExposure.choices,
        default=SunExposure.DIRECT,
    )

    water_available = models.BooleanField(
        default=True,
    )

    rest_area_available = models.BooleanField(
        default=True,
    )

    worker_category = models.CharField(
        max_length=120,
        default="General Adult (16–60 years)",
    )

    notes = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED,
    )

    original_start_time = models.TimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-activity_date",
            "-start_time",
            "-created_at",
        ]

    def __str__(self):
        return (
            f"{self.activity_type.name} - "
            f"{self.location} - "
            f"{self.activity_date}"
        )