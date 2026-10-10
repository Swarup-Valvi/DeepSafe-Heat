from datetime import datetime
from decimal import Decimal

import requests
from django.utils import timezone

from weather_data.models import WeatherRecord


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


class WeatherServiceError(Exception):
    """Raised when weather data cannot be retrieved or processed."""


def decimal_value(value):
    if value is None:
        return Decimal("0")

    return Decimal(str(value))


def build_activity_datetime(activity):
    """
    Combines the activity date and start time into one datetime.
    """

    activity_datetime = datetime.combine(
        activity.activity_date,
        activity.start_time,
    )

    if timezone.is_naive(activity_datetime):
        activity_datetime = timezone.make_aware(
            activity_datetime,
            timezone.get_current_timezone(),
        )

    return activity_datetime


def find_closest_hour_index(hourly_times, target_datetime):
    """
    Finds the hourly forecast entry closest to the activity time.
    """

    if not hourly_times:
        raise WeatherServiceError(
            "The weather service returned no hourly forecast times."
        )

    target_naive = target_datetime.replace(
        tzinfo=None,
        minute=0,
        second=0,
        microsecond=0,
    )

    parsed_times = []

    for value in hourly_times:
        parsed_times.append(
            datetime.fromisoformat(value)
        )

    return min(
        range(len(parsed_times)),
        key=lambda index: abs(
            parsed_times[index] - target_naive
        ),
    )


def get_hourly_value(hourly_data, field_name, index):
    values = hourly_data.get(field_name)

    if values is None:
        raise WeatherServiceError(
            f"Weather field '{field_name}' was not returned."
        )

    if index >= len(values):
        raise WeatherServiceError(
            f"Weather field '{field_name}' has incomplete data."
        )

    return values[index]


def fetch_weather_for_activity(activity):
    """
    Fetches forecast weather for an activity and saves a WeatherRecord.
    """

    if activity.latitude is None or activity.longitude is None:
        raise WeatherServiceError(
            "The activity must have latitude and longitude."
        )

    activity_datetime = build_activity_datetime(activity)

    params = {
        "latitude": float(activity.latitude),
        "longitude": float(activity.longitude),
        "hourly": ",".join(
            [
                "temperature_2m",
                "apparent_temperature",
                "relative_humidity_2m",
                "uv_index",
                "wind_speed_10m",
                "weather_code",
            ]
        ),
        "start_date": activity.activity_date.isoformat(),
        "end_date": activity.activity_date.isoformat(),
        "timezone": "auto",
        "wind_speed_unit": "kmh",
    }

    try:
        response = requests.get(
            OPEN_METEO_URL,
            params=params,
            timeout=15,
        )

        response.raise_for_status()

    except requests.Timeout as error:
        raise WeatherServiceError(
            "The weather service timed out."
        ) from error

    except requests.RequestException as error:
        raise WeatherServiceError(
            "Unable to retrieve weather data."
        ) from error

    try:
        payload = response.json()
    except ValueError as error:
        raise WeatherServiceError(
            "The weather service returned invalid JSON."
        ) from error

    if "error" in payload:
        raise WeatherServiceError(
            payload.get(
                "reason",
                "The weather service returned an error.",
            )
        )

    hourly = payload.get("hourly", {})
    hourly_times = hourly.get("time", [])

    index = find_closest_hour_index(
        hourly_times=hourly_times,
        target_datetime=activity_datetime,
    )

    forecast_time_text = get_hourly_value(
        hourly,
        "time",
        index,
    )

    forecast_time = datetime.fromisoformat(
        forecast_time_text
    )

    if timezone.is_naive(forecast_time):
        forecast_time = timezone.make_aware(
            forecast_time,
            timezone.get_current_timezone(),
        )

    temperature = get_hourly_value(
        hourly,
        "temperature_2m",
        index,
    )

    feels_like = get_hourly_value(
        hourly,
        "apparent_temperature",
        index,
    )

    humidity = get_hourly_value(
        hourly,
        "relative_humidity_2m",
        index,
    )

    uv_index = get_hourly_value(
        hourly,
        "uv_index",
        index,
    )

    wind_speed = get_hourly_value(
        hourly,
        "wind_speed_10m",
        index,
    )

    weather_code = get_hourly_value(
        hourly,
        "weather_code",
        index,
    )

    weather_record = WeatherRecord.objects.create(
    location=activity.location,
    latitude=activity.latitude,
    longitude=activity.longitude,
    recorded_at=forecast_time,
    temperature=decimal_value(temperature),
    feels_like=decimal_value(feels_like),
    humidity=decimal_value(humidity),
    uv_index=decimal_value(uv_index),
    wind_speed=decimal_value(wind_speed),
    condition=f"Weather code {weather_code}",
    source=WeatherRecord.Source.OPEN_METEO,
    status=WeatherRecord.Status.SYNCED,
    external_reference=forecast_time_text,
    raw_data={
        "provider": "Open-Meteo",
        "timezone": payload.get("timezone"),
        "timezone_abbreviation": payload.get(
            "timezone_abbreviation"
        ),
        "utc_offset_seconds": payload.get(
            "utc_offset_seconds"
        ),
        "forecast_time": forecast_time_text,
        "weather_code": weather_code,
        "units": payload.get(
            "hourly_units",
            {},
        ),
    },
)

    return weather_record