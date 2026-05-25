# tests/test_auth.py
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@test.com',
        password='testpass123'
    )


@pytest.fixture
def auth_client(client, user):
    response = client.post('/api/auth/login/', {
        'username': 'testuser',
        'password': 'testpass123'
    }, format='json')
    token = response.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


@pytest.mark.django_db
def test_register_user(client):
    response = client.post('/api/auth/register/', {
        'username': 'newuser',
        'email': 'new@test.com',
        'password': 'newpass123'
    }, format='json')
    assert response.status_code == 201
    assert response.data['username'] == 'newuser'


@pytest.mark.django_db
def test_login_user(client, user):
    response = client.post('/api/auth/login/', {
        'username': 'testuser',
        'password': 'testpass123'
    }, format='json')
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data


@pytest.mark.django_db
def test_login_wrong_password(client, user):
    response = client.post('/api/auth/login/', {
        'username': 'testuser',
        'password': 'wrongpass'
    }, format='json')
    assert response.status_code == 401