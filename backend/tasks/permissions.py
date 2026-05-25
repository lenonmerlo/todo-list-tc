from rest_framework import permissions

class IsTaskOwnerOrReadOnly(permissions.BasePermission):
    """Allow shared users to read tasks, but only owners can modify them."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.owner == request.user