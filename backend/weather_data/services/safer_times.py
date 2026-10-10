from __future__ import annotations

from datetime import datetime, time, timedelta
from typing import Any

import requests
from django.conf import settings
from django.utils import timezone

from risk_engine.services.risk_calculator import calculate_risk


OPEN_METEO_FORECAST_URL = (
    "https://api.open-meteo.com/v1/forecast"
)

HOURLY_FIELDS = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "uv_index",
    "wind_speed_10m",
]

# Candidate start times presented to the supervisor.
CANDIDATE_HOURS = [
    6,
    8,
    10,
    12,
    14,
    16,
    18,
    20,
]


class SaferTimeServiceError(Exception):
    """Raised when safer-time forecast data cannot be generated."""


def _to_float(
    value: Any,
    default: float = 0.0,
) -> float:
    try:
        if value is None:
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


def _round(value: float) -> float:
    return round(float(value), 2)


def _get_timezone_name() -> str:
    return getattr(
        settings,
        "TIME_ZONE",
        "Asia/Kolkata",
    )


def _fetch_hourly_forecast(
    *,
    latitude: float,
    longitude: float,
    start_date,
    end_date,
) -> dict[str, Any]:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join(HOURLY_FIELDS),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "timezone": _get_timezone_name(),
        "wind_speed_unit": "kmh",
    }

    try:
        response = requests.get(
            OPEN_METEO_FORECAST_URL,
            params=params,
            timeout=15,
        )

        response.raise_for_status()

    except requests.RequestException as exc:
        raise SaferTimeServiceError(
            "Unable to retrieve hourly weather forecast."
        ) from exc

    data = response.json()

    hourly = data.get("hourly")

    if not hourly or not hourly.get("time"):
        raise SaferTimeServiceError(
            "Hourly forecast data is unavailable."
        )

    return hourly


def _build_hourly_rows(
    hourly: dict[str, Any],
) -> list[dict[str, Any]]:
    times = hourly.get("time", [])

    temperatures = hourly.get(
        "temperature_2m",
        [],
    )

    feels_like = hourly.get(
        "apparent_temperature",
        [],
    )

    humidity = hourly.get(
        "relative_humidity_2m",
        [],
    )

    uv_index = hourly.get(
        "uv_index",
        [],
    )

    wind_speed = hourly.get(
        "wind_speed_10m",
        [],
    )

    rows = []

    for index, timestamp in enumerate(times):
        try:
            dt = datetime.fromisoformat(timestamp)

        except ValueError:
            continue

        rows.append(
            {
                "datetime": dt,
                "temperature": _to_float(
                    temperatures[index]
                    if index < len(temperatures)
                    else None
                ),
                "feels_like": _to_float(
                    feels_like[index]
                    if index < len(feels_like)
                    else None
                ),
                "humidity": _to_float(
                    humidity[index]
                    if index < len(humidity)
                    else None
                ),
                "uv_index": _to_float(
                    uv_index[index]
                    if index < len(uv_index)
                    else None
                ),
                "wind_speed": _to_float(
                    wind_speed[index]
                    if index < len(wind_speed)
                    else None
                ),
            }
        )

    return rows


def _get_weather_for_window(
    rows: list[dict[str, Any]],
    *,
    start_datetime: datetime,
    end_datetime: datetime,
) -> dict[str, float] | None:
    window_rows = [
        row
        for row in rows
        if start_datetime
        <= row["datetime"]
        < end_datetime
    ]

    if not window_rows:
        return None

    # For heat-risk comparison we use the more hazardous
    # temperature / UV conditions across the selected period.
    # Humidity and wind use period averages.
    return {
        "temperature": _round(
            max(
                row["temperature"]
                for row in window_rows
            )
        ),
        "feels_like": _round(
            max(
                row["feels_like"]
                for row in window_rows
            )
        ),
        "humidity": _round(
            sum(
                row["humidity"]
                for row in window_rows
            )
            / len(window_rows)
        ),
        "uv_index": _round(
            max(
                row["uv_index"]
                for row in window_rows
            )
        ),
        "wind_speed": _round(
            sum(
                row["wind_speed"]
                for row in window_rows
            )
            / len(window_rows)
        ),
    }


def _risk_value(result: dict[str, Any]) -> float:
    return _to_float(
        result.get("risk_score")
    )


def get_safer_time_slots(
    activity,
) -> list[dict[str, Any]]:
    if (
        activity.latitude is None
        or activity.longitude is None
    ):
        raise SaferTimeServiceError(
            "Activity latitude and longitude are required."
        )

    activity_date = activity.activity_date

    duration_hours = float(
        activity.duration_hours
    )

    if duration_hours <= 0:
        raise SaferTimeServiceError(
            "Activity duration must be greater than zero."
        )

    # Fetch the activity date plus the following day so
    # evening activities that extend past midnight still work.
    hourly = _fetch_hourly_forecast(
        latitude=float(activity.latitude),
        longitude=float(activity.longitude),
        start_date=activity_date,
        end_date=activity_date + timedelta(days=1),
    )

    rows = _build_hourly_rows(hourly)

    slots = []

    for hour in CANDIDATE_HOURS:
        start_datetime = datetime.combine(
            activity_date,
            time(hour=hour),
        )

        end_datetime = (
            start_datetime
            + timedelta(
                hours=duration_hours
            )
        )

        weather = _get_weather_for_window(
            rows,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
        )

        if weather is None:
            continue

        risk = calculate_risk(
            activity=activity,
            temperature=weather[
                "temperature"
            ],
            feels_like=weather[
                "feels_like"
            ],
            humidity=weather[
                "humidity"
            ],
            uv_index=weather[
                "uv_index"
            ],
            wind_speed=weather[
                "wind_speed"
            ],
        )

        slots.append(
            {
                "start_time":
                    start_datetime.time().strftime(
                        "%H:%M:%S"
                    ),

                "end_time":
                    end_datetime.time().strftime(
                        "%H:%M:%S"
                    ),

                "temperature":
                    weather["temperature"],

                "feels_like":
                    weather["feels_like"],

                "humidity":
                    weather["humidity"],

                "uv_index":
                    weather["uv_index"],

                "wind_speed":
                    weather["wind_speed"],

                "risk_score":
                    _round(
                        _risk_value(risk)
                    ),

                "risk_level":
                    risk.get(
                        "risk_level",
                        "UNKNOWN",
                    ),

                "recommendation":
                    risk.get(
                        "recommendation",
                        "",
                    ),
            }
        )

    slots.sort(
        key=lambda slot: (
            slot["risk_score"],
            slot["start_time"],
        )
    )

    for index, slot in enumerate(slots):
        slot["rank"] = index + 1
        slot["recommended"] = index < 3

        slot["is_current"] = (
            activity.start_time.strftime(
                "%H:%M"
            )
            ==
            slot["start_time"][:5]
        )

    return slots