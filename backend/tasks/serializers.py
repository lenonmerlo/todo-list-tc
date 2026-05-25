# tasks/serializers.py
from rest_framework import serializers
from .models import Task, Category
from django.contrib.auth.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')


class TaskSerializer(serializers.ModelSerializer):
    shared_with = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False,
    )

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'completed',
            'priority', 'due_date', 'category', 'shared_with',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')