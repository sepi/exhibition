import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_jigsaw_puzzle', '0014_gamegroup'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuizGame',
            fields=[
                ('game_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='django_jigsaw_puzzle.game')),
            ],
            bases=('django_jigsaw_puzzle.game',),
        ),
        migrations.CreateModel(
            name='GameSession',
            fields=[
                ('session_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('player_name', models.CharField(max_length=512)),
                ('ongoing', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_session', to='django_jigsaw_puzzle.game')),
            ],
        ),
        migrations.CreateModel(
            name='QuizQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=2048)),
                ('answer_1', models.CharField(max_length=1024)),
                ('correct_1', models.BooleanField(default=False)),
                ('answer_2', models.CharField(max_length=1024)),
                ('correct_2', models.BooleanField(default=False)),
                ('answer_3', models.CharField(max_length=1024)),
                ('correct_3', models.BooleanField(default=False)),
                ('answer_4', models.CharField(max_length=1024)),
                ('correct_4', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(db_index=True, default=0)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='questions', to='django_jigsaw_puzzle.quizgame')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='GameSessionPartialResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('result_boolean', models.BooleanField(blank=True, null=True)),
                ('result_number', models.FloatField(blank=True, null=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('game_session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partial_results', to='django_jigsaw_puzzle.gamesession')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partial_results', to='django_jigsaw_puzzle.quizquestion')),
            ],
        ),
]
