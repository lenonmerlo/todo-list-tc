from django.db import migrations, models
import django.core.validators


def backfill_status_from_completed(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    Task.objects.filter(completed=True).update(status='done')
    Task.objects.filter(completed=False).update(status='todo')


def reverse_backfill_status(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    Task.objects.filter(status='done').update(completed=True)
    Task.objects.exclude(status='done').update(completed=False)


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='status',
            field=models.CharField(
                choices=[
                    ('todo', 'A fazer'),
                    ('in_progress', 'Em andamento'),
                    ('waiting', 'Aguardando'),
                    ('done', 'Concluída'),
                ],
                default='todo',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='task',
            name='due_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='estimated_minutes',
            field=models.PositiveIntegerField(
                blank=True,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(1440),
                ],
            ),
        ),
        migrations.RunPython(
            backfill_status_from_completed,
            reverse_backfill_status,
        ),
    ]
