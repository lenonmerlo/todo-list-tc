# tasks/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('title', 'description')
    ordering_fields = ('created_at', 'due_date', 'priority')

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.filter(owner=user) | Task.objects.filter(shared_with=user)
        queryset = queryset.distinct()

        # filtros via query params
        completed = self.request.query_params.get('completed')
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')

        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == 'true')
        if category:
            queryset = queryset.filter(category__id=category)
        if priority:
            queryset = queryset.filter(priority=priority)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)