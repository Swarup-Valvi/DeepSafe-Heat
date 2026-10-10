"""
Seed demo data for DeepSafe-Heat / HeatSafe.

Usage:
    python manage.py seed_demo              # safe: only creates what's missing
    python manage.py seed_demo --reset      # wipes demo users first

Creates:
    - Admin user
    - Two supervisors
    - Common activity types
    - Sample planned activities (today, tomorrow, next week)
"""
from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from activities.models import ActivityType, PlannedActivity


DEMO_PASSWORD = "demo1234"


ACTIVITY_TYPES = [
    {
        "name": "Construction Work",
        "intensity": "HIGH",
        "default_exposure": "DIRECT",
        "description": "Heavy outdoor construction activity",
    },
    {
        "name": "Agriculture / Farm Work",
        "intensity": "MODERATE",
        "default_exposure": "DIRECT",
        "description": "Field work with moderate physical load",
    },
    {
        "name": "Delivery / Logistics",
        "intensity": "MODERATE",
        "default_exposure": "MIXED",
        "description": "Urban delivery routing",
    },
    {
        "name": "Event Setup / Teardown",
        "intensity": "HIGH",
        "default_exposure": "MIXED",
        "description": "Temporary outdoor event work",
    },
    {
        "name": "Light Outdoor Supervision",
        "intensity": "LOW",
        "default_exposure": "SHADED",
        "description": "Low-intensity observation / coordination",
    },
]


USERS = [
    {
        "username": "admin",
        "email": "admin@heatsafe.local",
        "role": "ADMINISTRATOR",
        "first_name": "Admin",
        "last_name": "User",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "username": "supervisor1",
        "email": "sup1@heatsafe.local",
        "role": "SUPERVISOR",
        "first_name": "Ravi",
        "last_name": "Kumar",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "username": "supervisor2",
        "email": "sup2@heatsafe.local",
        "role": "SUPERVISOR",
        "first_name": "Anita",
        "last_name": "Sharma",
        "is_staff": False,
        "is_superuser": False,
    },
]


class Command(BaseCommand):
    help = "Seed demo data for DeepSafe-Heat."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo users first (does NOT touch other users).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        reset = options["reset"]

        if reset:
            usernames = [u["username"] for u in USERS]
            deleted, _ = User.objects.filter(username__in=usernames).delete()
            self.stdout.write(self.style.WARNING(f"Reset: deleted {deleted} rows"))

        # ---------- Users ----------
        created_users = []
        for spec in USERS:
            user, created = User.objects.get_or_create(
                username=spec["username"],
                defaults={
                    "email": spec["email"],
                    "role": spec["role"],
                    "first_name": spec["first_name"],
                    "last_name": spec["last_name"],
                    "is_staff": spec["is_staff"],
                    "is_superuser": spec["is_superuser"],
                },
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            created_users.append((user, created))

        for user, created in created_users:
            marker = "created" if created else "exists"
            self.stdout.write(
                f"  [{marker}] user {user.username} (role={user.role})"
            )

        # ---------- Activity Types ----------
        types = {}
        for spec in ACTIVITY_TYPES:
            obj, created = ActivityType.objects.get_or_create(
                name=spec["name"],
                defaults={
                    "intensity": spec["intensity"],
                    "default_exposure": spec["default_exposure"],
                },
            )
            types[spec["name"]] = obj
            marker = "created" if created else "exists"
            self.stdout.write(f"  [{marker}] activity_type {spec['name']}")

        # ---------- Planned Activities ----------
        sup1 = User.objects.get(username="supervisor1")
        sup2 = User.objects.get(username="supervisor2")

        today = timezone.localdate()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=7)

        activities = [
            {
                "supervisor": sup1,
                "activity_type": types["Construction Work"],
                "location": "Pune, Maharashtra",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "activity_date": today,
                "start_time": time(7, 0),
                "duration_hours": 6,
                "sun_exposure": "DIRECT",
                "worker_category": "General Adult (16–60 years)",
            },
            {
                "supervisor": sup1,
                "activity_type": types["Delivery / Logistics"],
                "location": "Mumbai, Maharashtra",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "activity_date": today,
                "start_time": time(14, 0),
                "duration_hours": 4,
                "sun_exposure": "MIXED",
                "worker_category": "General Adult (16–60 years)",
            },
            {
                "supervisor": sup2,
                "activity_type": types["Agriculture / Farm Work"],
                "location": "Nashik, Maharashtra",
                "latitude": 19.9975,
                "longitude": 73.7898,
                "activity_date": tomorrow,
                "start_time": time(6, 30),
                "duration_hours": 5,
                "sun_exposure": "DIRECT",
                "worker_category": "General Adult (16–60 years)",
            },
            {
                "supervisor": sup2,
                "activity_type": types["Event Setup / Teardown"],
                "location": "Pune, Maharashtra",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "activity_date": tomorrow,
                "start_time": time(11, 0),
                "duration_hours": 5,
                "sun_exposure": "MIXED",
                "worker_category": "General Adult (16–60 years)",
            },
            {
                "supervisor": sup1,
                "activity_type": types["Light Outdoor Supervision"],
                "location": "Pune, Maharashtra",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "activity_date": next_week,
                "start_time": time(9, 0),
                "duration_hours": 3,
                "sun_exposure": "SHADED",
                "worker_category": "General Adult (16–60 years)",
            },
        ]

        created_count = 0
        for spec in activities:
            _, created = PlannedActivity.objects.get_or_create(
                supervisor=spec["supervisor"],
                activity_type=spec["activity_type"],
                activity_date=spec["activity_date"],
                start_time=spec["start_time"],
                defaults={
                    "location": spec["location"],
                    "latitude": spec["latitude"],
                    "longitude": spec["longitude"],
                    "duration_hours": spec["duration_hours"],
                    "sun_exposure": spec["sun_exposure"],
                    "water_available": True,
                    "rest_area_available": True,
                    "worker_category": spec["worker_category"],
                    "status": "PLANNED",
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Created {created_count} new planned activities."
            )
        )
        self.stdout.write("")
        self.stdout.write("Login credentials:")
        for spec in USERS:
            self.stdout.write(
                f"  {spec['username']:14s} / {DEMO_PASSWORD}   ({spec['role']})"
            )
