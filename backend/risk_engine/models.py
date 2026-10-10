from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from activities.models import PlannedActivity
from weather_data.models import WeatherRecord


class RiskRule(models.Model):
    name = models.CharField(
        max_length=120,
        default="Default Heat Risk Rules",
    )

    low_max = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=3.90,
    )

    moderate_max = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=5.90,
    )

    high_max = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=7.90,
    )

    very_high_min = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=8.00,
    )

    temperature_weight = models.PositiveIntegerField(
        default=35,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    humidity_weight = models.PositiveIntegerField(
        default=20,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    uv_weight = models.PositiveIntegerField(
        default=20,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    activity_weight = models.PositiveIntegerField(
        default=15,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    duration_weight = models.PositiveIntegerField(
        default=10,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    use_feels_like = models.BooleanField(
        default=True,
    )

    consider_sun_exposure = models.BooleanField(
        default=True,
    )

    consider_water_availability = models.BooleanField(
        default=True,
    )

    consider_rest_area = models.BooleanField(
        default=True,
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
        ordering = ["-is_active", "-updated_at"]

    def __str__(self):
        return self.name

    @property
    def total_weight(self):
        return (
            self.temperature_weight
            + self.humidity_weight
            + self.uv_weight
            + self.activity_weight
            + self.duration_weight
        )


class RiskAssessment(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = "LOW", "Low"
        MODERATE = "MODERATE", "Moderate"
        HIGH = "HIGH", "High"
        VERY_HIGH = "VERY_HIGH", "Very High"

    class AssessmentMethod(models.TextChoices):
        RULE_BASED = "RULE_BASED", "Rule Based"
        MACHINE_LEARNING = (
            "MACHINE_LEARNING",
            "Machine Learning",
        )
        HYBRID = "HYBRID", "Hybrid"

    activity = models.ForeignKey(
        PlannedActivity,
        on_delete=models.CASCADE,
        related_name="assessments",
    )

    weather_record = models.ForeignKey(
        WeatherRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="risk_assessments",
    )

    risk_rule = models.ForeignKey(
        RiskRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="risk_assessments",
    )

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
    )

    wind_speed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    temperature_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    humidity_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    uv_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    activity_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    duration_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    risk_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10),
        ],
    )

    risk_level = models.CharField(
        max_length=20,
        choices=RiskLevel.choices,
    )

    assessment_method = models.CharField(
        max_length=30,
        choices=AssessmentMethod.choices,
        default=AssessmentMethod.RULE_BASED,
    )

    recommendation = models.TextField()

    explanation = models.JSONField(
        default=dict,
        blank=True,
    )

    safer_start_time = models.TimeField(
        null=True,
        blank=True,
    )

    safer_end_time = models.TimeField(
        null=True,
        blank=True,
    )

    alternative_start_time = models.TimeField(
        null=True,
        blank=True,
    )

    alternative_end_time = models.TimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.activity} - "
            f"{self.risk_level} "
            f"({self.risk_score})"
        )