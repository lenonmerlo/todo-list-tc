# tasks/serializers.py
from rest_framework import serializers
from .models import Task, Category
from django.contrib.auth.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')

class SharedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class TaskSerializer(serializers.ModelSerializer):
    shared_with = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False,
    )
    shared_with_details = SharedUserSerializer(
        source='shared_with',
        many=True,
        read_only=True,
    )
    owner_details = SharedUserSerializer(
        source='owner',
        read_only=True,
    )

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'completed',
            'status', 'priority', 'due_date', 'due_time', 'estimated_minutes',
            'category', 'shared_with',
            'shared_with_details', 'owner_details',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['category'].queryset = Category.objects.filter(
                owner=request.user
            )

    def validate_category(self, category):
        request = self.context.get('request')

        if category and request and category.owner != request.user:
            raise serializers.ValidationError(
                'A categoria deve pertencer ao usuário autenticado.'
            )

        return category

    def validate_estimated_minutes(self, value):
        if value is None:
            return value

        if value < 1 or value > 1440:
            raise serializers.ValidationError(
                'A duracao estimada deve estar entre 1 e 1440 minutos.'
            )

        return value

    def _sync_task_state(self, task, validated_data, *, creating=False):
        status_provided = 'status' in validated_data
        completed_provided = 'completed' in validated_data

        if creating and not status_provided and not completed_provided:
            task.sync_status_and_completed(status_provided=False, completed_provided=True)
            return

        task.sync_status_and_completed(
            status_provided=status_provided,
            completed_provided=completed_provided,
        )

    def create(self, validated_data):
        shared_with = validated_data.pop('shared_with', [])
        task = Task(**validated_data)
        self._sync_task_state(task, validated_data, creating=True)
        task.save()

        if shared_with:
            task.shared_with.set(shared_with)

        return task

    def update(self, instance, validated_data):
        shared_with = validated_data.pop('shared_with', serializers.empty)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        self._sync_task_state(instance, validated_data)
        instance.save()

        if shared_with is not serializers.empty:
            instance.shared_with.set(shared_with)

        return instance