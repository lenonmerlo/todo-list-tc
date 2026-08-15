# tests/test_tasks.py
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from tasks.models import Task, Category
from unittest.mock import Mock, patch


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
        'priority': 'high',
        'status': 'in_progress',
        'due_date': '2026-09-01',
        'due_time': '09:30',
        'estimated_minutes': 90,
    }, format='json')
    assert response.status_code == 201
    assert response.data['title'] == 'Test task'
    assert response.data['completed'] == False
    assert response.data['status'] == 'in_progress'
    assert response.data['due_date'] == '2026-09-01'
    assert response.data['due_time'].startswith('09:30')
    assert response.data['estimated_minutes'] == 90


@pytest.mark.django_db
def test_create_task_rejects_invalid_estimated_minutes(auth_client):
    response = auth_client.post('/api/tasks/', {
        'title': 'Invalid duration task',
        'estimated_minutes': 0,
    }, format='json')

    assert response.status_code == 400
    assert 'estimated_minutes' in response.data


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
    assert response.data['status'] == 'done'


@pytest.mark.django_db
def test_status_done_sets_completed_true(auth_client, user):
    task = Task.objects.create(title='Task', owner=user, completed=False, status='todo')

    response = auth_client.patch(f'/api/tasks/{task.id}/', {
        'status': 'done'
    }, format='json')

    assert response.status_code == 200
    assert response.data['status'] == 'done'
    assert response.data['completed'] is True


@pytest.mark.django_db
def test_status_not_done_sets_completed_false(auth_client, user):
    task = Task.objects.create(title='Task', owner=user, completed=True, status='done')

    response = auth_client.patch(f'/api/tasks/{task.id}/', {
        'status': 'waiting'
    }, format='json')

    assert response.status_code == 200
    assert response.data['status'] == 'waiting'
    assert response.data['completed'] is False


@pytest.mark.django_db
def test_completed_false_sets_status_todo(auth_client, user):
    task = Task.objects.create(title='Task', owner=user, completed=True, status='done')

    response = auth_client.patch(f'/api/tasks/{task.id}/', {
        'completed': False
    }, format='json')

    assert response.status_code == 200
    assert response.data['completed'] is False
    assert response.data['status'] == 'todo'


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

@pytest.mark.django_db
def test_shared_user_can_view_shared_task(auth_client, user):
    shared_user = User.objects.create_user(
        username='shareduser',
        email='shared@test.com',
        password='testpass123'
    )
    task = Task.objects.create(title='Shared task', owner=shared_user)
    task.shared_with.add(user)

    response = auth_client.get(f'/api/tasks/{task.id}/')

    assert response.status_code == 200
    assert response.data['title'] == 'Shared task'


@pytest.mark.django_db
def test_shared_user_cannot_update_shared_task(auth_client, user):
    owner = User.objects.create_user(
        username='owner',
        email='owner@test.com',
        password='testpass123'
    )
    task = Task.objects.create(title='Shared task', owner=owner)
    task.shared_with.add(user)

    response = auth_client.patch(f'/api/tasks/{task.id}/', {
        'title': 'Changed by shared user'
    }, format='json')

    assert response.status_code == 403
    task.refresh_from_db()
    assert task.title == 'Shared task'


@pytest.mark.django_db
def test_shared_user_cannot_delete_shared_task(auth_client, user):
    owner = User.objects.create_user(
        username='owner',
        email='owner@test.com',
        password='testpass123'
    )
    task = Task.objects.create(title='Shared task', owner=owner)
    task.shared_with.add(user)

    response = auth_client.delete(f'/api/tasks/{task.id}/')

    assert response.status_code == 403
    assert Task.objects.filter(id=task.id).exists()

@pytest.mark.django_db
def test_cannot_create_task_with_another_users_category(auth_client):
    other_user = User.objects.create_user(
        username='otheruser',
        email='other@test.com',
        password='testpass123'
    )
    category = Category.objects.create(name='Private category', owner=other_user)

    response = auth_client.post('/api/tasks/', {
        'title': 'Invalid task',
        'category': category.id
    }, format='json')

    assert response.status_code == 400
    assert Task.objects.filter(title='Invalid task').exists() is False

@pytest.mark.django_db
def test_address_lookup_returns_viacep_data(auth_client):
    viacep_payload = {
        'cep': '01001-000',
        'logradouro': 'Praça da Sé',
        'bairro': 'Sé',
        'localidade': 'São Paulo',
        'uf': 'SP',
    }

    mocked_response = Mock()
    mocked_response.json.return_value = viacep_payload
    mocked_response.raise_for_status.return_value = None

    with patch('tasks.integrations.requests.get', return_value=mocked_response):
        response = auth_client.get('/api/address/01001000/')

    assert response.status_code == 200
    assert response.data['cep'] == '01001-000'
    assert response.data['localidade'] == 'São Paulo'


@pytest.mark.django_db
def test_address_lookup_returns_404_when_cep_is_not_found(auth_client):
    mocked_response = Mock()
    mocked_response.json.return_value = {'erro': True}
    mocked_response.raise_for_status.return_value = None

    with patch('tasks.integrations.requests.get', return_value=mocked_response):
        response = auth_client.get('/api/address/00000000/')

    assert response.status_code == 404
    assert response.data['error'] == 'CEP 00000000 não encontrado.'

@pytest.mark.django_db
def test_task_response_includes_shared_user_details(auth_client):
    shared_user = User.objects.create_user(
        username='shareduser',
        email='shared@test.com',
        password='testpass123'
    )

    response = auth_client.post('/api/tasks/', {
        'title': 'Task with shared details',
        'shared_with': [shared_user.id]
    }, format='json')

    assert response.status_code == 201
    assert response.data['shared_with'] == [shared_user.id]
    assert response.data['shared_with_details'][0]['id'] == shared_user.id
    assert response.data['shared_with_details'][0]['username'] == 'shareduser'
    assert response.data['owner_details']['username'] == 'testuser'


@pytest.mark.django_db
def test_owner_can_share_task_with_existing_user(auth_client, user):
    receiver = User.objects.create_user(
        username='receiver',
        email='receiver@test.com',
        password='testpass123'
    )
    task = Task.objects.create(title='Share me', owner=user)

    response = auth_client.post(f'/api/tasks/{task.id}/share/', {
        'username': 'receiver'
    }, format='json')

    assert response.status_code == 200
    assert response.data['message'] == 'Tarefa compartilhada com receiver.'
    task.refresh_from_db()
    assert task.shared_with.filter(id=receiver.id).exists()


@pytest.mark.django_db
def test_non_owner_cannot_share_task(auth_client, user):
    owner = User.objects.create_user(
        username='owner2',
        email='owner2@test.com',
        password='testpass123'
    )
    task = Task.objects.create(title='Private', owner=owner)

    response = auth_client.post(f'/api/tasks/{task.id}/share/', {
        'username': 'owner2'
    }, format='json')

    assert response.status_code == 404


@pytest.mark.django_db
def test_share_returns_404_for_unknown_username(auth_client, user):
    task = Task.objects.create(title='Task', owner=user)

    response = auth_client.post(f'/api/tasks/{task.id}/share/', {
        'username': 'missinguser'
    }, format='json')

    assert response.status_code == 404
    assert response.data['error'] == 'Usuario nao encontrado.'