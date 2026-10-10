from rest_framework.permissions import BasePermission


class IsSupervisor(BasePermission):
    message = "Only supervisors can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "SUPERVISOR"
        )


class IsAdministrator(BasePermission):
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMINISTRATOR"
        )