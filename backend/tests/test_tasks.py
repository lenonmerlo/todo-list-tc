# tests/test_tasks.py
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from tasks.models import Task, Category


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
def test_create_task(auth_client):
    response = auth_client.post('/api/tasks/', {
        'title': 'Test task',
        'description': 'Test description',
        'priority': 'high'
    }, format='json')
    assert response.status_code == 201
    assert response.data['title'] == 'Test task'
    assert response.data['completed'] == False


@pytest.mark.django_db
def test_list_tasks(auth_client, user):
    Task.objects.create(title='Task 1', owner=user)
    Task.objects.create(title='Task 2', owner=user)
    response = auth_client.get('/api/tasks/')
    assert response.status_code == 200
    assert response.data['count'] == 2


@pytest.mark.django_db
def test_complete_task(auth_client, user):
    task = Task.objects.create(title='Task', owner=user)
    response = auth_client.patch(f'/api/tasks/{task.id}/', {
        'completed': True
    }, format='json')
    assert response.status_code == 200
    assert response.data['completed'] == True


@pytest.mark.django_db
def test_delete_task(auth_client, user):
    task = Task.objects.create(title='Task', owner=user)
    response = auth_client.delete(f'/api/tasks/{task.id}/')
    assert response.status_code == 204


@pytest.mark.django_db
def test_task_filter_by_completed(auth_client, user):
    Task.objects.create(title='Done', owner=user, completed=True)
    Task.objects.create(title='Pending', owner=user, completed=False)
    response = auth_client.get('/api/tasks/?completed=true')
    assert response.status_code == 200
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_create_category(auth_client):
    response = auth_client.post('/api/categories/', {
        'name': 'Work'
    }, format='json')
    assert response.status_code == 201
    assert response.data['name'] == 'Work'


@pytest.mark.django_db
def test_unauthenticated_access(client):
    response = client.get('/api/tasks/')
    assert response.status_code == 401