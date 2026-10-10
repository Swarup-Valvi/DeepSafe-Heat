from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminUserViewSet,
    CurrentUserView,
    LoginView,
    LogoutView,
    RegisterView,
)


router = DefaultRouter()
router.register(
    "users",
    AdminUserViewSet,
    basename="admin-users",
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),
]

urlpatterns += router.urls