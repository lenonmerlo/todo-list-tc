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
            'priority', 'due_date', 'category', 'shared_with',
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