from datetime import time
from decimal import Decimal, ROUND_HALF_UP

from risk_engine.models import RiskAssessment, RiskRule


MIN_SCORE = Decimal("0")
MAX_SCORE = Decimal("10")


def decimal_value(value):
    return Decimal(str(value))


def clamp(value, minimum=MIN_SCORE, maximum=MAX_SCORE):
    value = decimal_value(value)
    return max(minimum, min(value, maximum))


def calculate_temperature_score(temperature):
    """
    Converts temperature or feels-like temperature into a 0–10 score.
    """

    temperature = decimal_value(temperature)

    if temperature < Decimal("27"):
        return Decimal("1.00")

    if temperature < Decimal("32"):
        return Decimal("3.00")

    if temperature < Decimal("37"):
        return Decimal("5.00")

    if temperature < Decimal("41"):
        return Decimal("7.50")

    return Decimal("10.00")


def calculate_humidity_score(humidity):
    humidity = decimal_value(humidity)

    if humidity < Decimal("30"):
        return Decimal("2.00")

    if humidity < Decimal("50"):
        return Decimal("4.00")

    if humidity < Decimal("70"):
        return Decimal("7.00")

    return Decimal("9.00")


def calculate_uv_score(uv_index):
    uv_index = decimal_value(uv_index)

    if uv_index < Decimal("3"):
        return Decimal("1.00")

    if uv_index < Decimal("6"):
        return Decimal("4.00")

    if uv_index < Decimal("8"):
        return Decimal("7.00")

    if uv_index < Decimal("11"):
        return Decimal("9.00")

    return Decimal("10.00")


def calculate_activity_score(activity, rule):
    intensity_scores = {
        "LOW": Decimal("2.50"),
        "MODERATE": Decimal("6.00"),
        "HIGH": Decimal("9.00"),
    }

    score = intensity_scores.get(
        activity.activity_type.intensity,
        Decimal("6.00"),
    )

    if rule.consider_sun_exposure:
        if activity.sun_exposure == "DIRECT":
            score += Decimal("1.00")
        elif activity.sun_exposure == "SHADED":
            score -= Decimal("1.00")

    if (
        rule.consider_water_availability
        and not activity.water_available
    ):
        score += Decimal("0.50")

    if (
        rule.consider_rest_area
        and not activity.rest_area_available
    ):
        score += Decimal("0.50")

    return clamp(score)


def calculate_duration_score(duration_hours):
    duration = decimal_value(duration_hours)

    if duration <= Decimal("1"):
        return Decimal("2.00")

    if duration <= Decimal("2"):
        return Decimal("4.00")

    if duration <= Decimal("4"):
        return Decimal("7.00")

    return Decimal("9.00")


def determine_risk_level(score, rule):
    score = decimal_value(score)

    if score <= rule.low_max:
        return RiskAssessment.RiskLevel.LOW

    if score <= rule.moderate_max:
        return RiskAssessment.RiskLevel.MODERATE

    if score <= rule.high_max:
        return RiskAssessment.RiskLevel.HIGH

    return RiskAssessment.RiskLevel.VERY_HIGH


def generate_recommendation(risk_level):
    recommendations = {
        RiskAssessment.RiskLevel.LOW: (
            "Heat risk is low. The activity can proceed as planned. "
            "Continue monitoring weather conditions."
        ),
        RiskAssessment.RiskLevel.MODERATE: (
            "Heat risk is moderate. Consider shorter work periods, "
            "additional shade, and avoiding unnecessary exposure."
        ),
        RiskAssessment.RiskLevel.HIGH: (
            "Heat risk is high. Rescheduling to the early morning or "
            "evening is recommended."
        ),
        RiskAssessment.RiskLevel.VERY_HIGH: (
            "Heat risk is very high. Avoid conducting this activity at "
            "the selected time and choose a safer time window."
        ),
    }

    return recommendations[risk_level]


def generate_safer_times(risk_level):
    if risk_level == RiskAssessment.RiskLevel.LOW:
        return {
            "safer_start_time": time(6, 0),
            "safer_end_time": time(10, 0),
            "alternative_start_time": time(17, 30),
            "alternative_end_time": time(20, 0),
        }

    if risk_level == RiskAssessment.RiskLevel.MODERATE:
        return {
            "safer_start_time": time(6, 0),
            "safer_end_time": time(9, 30),
            "alternative_start_time": time(18, 0),
            "alternative_end_time": time(20, 0),
        }

    return {
        "safer_start_time": time(6, 0),
        "safer_end_time": time(9, 0),
        "alternative_start_time": time(18, 30),
        "alternative_end_time": time(20, 30),
    }


def get_active_rule():
    rule = (
        RiskRule.objects
        .filter(is_active=True)
        .order_by("-updated_at")
        .first()
    )

    if rule is None:
        rule = RiskRule.objects.create(
            name="Default Heat Risk Rules",
        )

    return rule


def calculate_risk(
    activity,
    temperature,
    feels_like,
    humidity,
    uv_index,
    wind_speed=0,
):
    rule = get_active_rule()

    selected_temperature = (
        feels_like
        if rule.use_feels_like
        else temperature
    )

    temperature_score = calculate_temperature_score(
        selected_temperature
    )
    humidity_score = calculate_humidity_score(humidity)
    uv_score = calculate_uv_score(uv_index)
    activity_score = calculate_activity_score(
        activity,
        rule,
    )
    duration_score = calculate_duration_score(
        activity.duration_hours
    )

    total_weight = decimal_value(rule.total_weight)

    if total_weight <= 0:
        raise ValueError(
            "The active risk rule must have a total weight greater than zero."
        )

    weighted_total = (
        temperature_score
        * decimal_value(rule.temperature_weight)
        + humidity_score
        * decimal_value(rule.humidity_weight)
        + uv_score
        * decimal_value(rule.uv_weight)
        + activity_score
        * decimal_value(rule.activity_weight)
        + duration_score
        * decimal_value(rule.duration_weight)
    )

    risk_score = weighted_total / total_weight

    risk_score = clamp(risk_score).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    risk_level = determine_risk_level(
        risk_score,
        rule,
    )

    safer_times = generate_safer_times(
        risk_level
    )

    explanation = {
        "selected_temperature_source": (
            "feels_like"
            if rule.use_feels_like
            else "temperature"
        ),
        "scores": {
            "temperature": float(temperature_score),
            "humidity": float(humidity_score),
            "uv": float(uv_score),
            "activity": float(activity_score),
            "duration": float(duration_score),
        },
        "weights": {
            "temperature": rule.temperature_weight,
            "humidity": rule.humidity_weight,
            "uv": rule.uv_weight,
            "activity": rule.activity_weight,
            "duration": rule.duration_weight,
        },
        "total_weight": rule.total_weight,
    }

    return {
        "risk_rule": rule,
        "temperature": decimal_value(temperature),
        "feels_like": decimal_value(feels_like),
        "humidity": decimal_value(humidity),
        "uv_index": decimal_value(uv_index),
        "wind_speed": decimal_value(wind_speed),
        "temperature_score": temperature_score,
        "humidity_score": humidity_score,
        "uv_score": uv_score,
        "activity_score": activity_score,
        "duration_score": duration_score,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "assessment_method": (
            RiskAssessment.AssessmentMethod.RULE_BASED
        ),
        "recommendation": generate_recommendation(
            risk_level
        ),
        "explanation": explanation,
        **safer_times,
    }