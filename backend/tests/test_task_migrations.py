import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


@pytest.mark.django_db(transaction=True)
def test_migration_maps_completed_to_status():
    executor = MigrationExecutor(connection)

    old_state = executor.migrate([('tasks', '0001_initial')])
    old_task_model = old_state.apps.get_model('tasks', 'Task')
    user_model = old_state.apps.get_model('auth', 'User')

    user = user_model.objects.create(username='migration_user')

    done_task = old_task_model.objects.create(
        title='Done task before migration',
        owner=user,
        completed=True,
    )
    todo_task = old_task_model.objects.create(
        title='Todo task before migration',
        owner=user,
        completed=False,
    )

    executor = MigrationExecutor(connection)
    new_state = executor.migrate([('tasks', '0002_planner_sprint_1_fields')])
    task_model = new_state.apps.get_model('tasks', 'Task')

    migrated_done = task_model.objects.get(id=done_task.id)
    migrated_todo = task_model.objects.get(id=todo_task.id)

    assert migrated_done.status == 'done'
    assert migrated_todo.status == 'todo'
