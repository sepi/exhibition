# Generated by Django 5.0.2 on 2025-01-06 10:31

import django.db.models.deletion
import filer.fields.image
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cms', '0022_auto_20180620_1551'),
        migrations.swappable_dependency(settings.FILER_IMAGE_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DifficultyLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('rows', models.IntegerField()),
                ('columns', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('copyright_notice', models.CharField(max_length=2048)),
                ('color', models.CharField(default='#fff', max_length=7)),
            ],
        ),
        migrations.CreateModel(
            name='ImageSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
            ],
        ),
        migrations.CreateModel(
            name='ImageGame',
            fields=[
                ('game_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='django_jigsaw_puzzle.game')),
                ('image_set', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='django_jigsaw_puzzle.imageset')),
            ],
            bases=('django_jigsaw_puzzle.game',),
        ),
        migrations.CreateModel(
            name='GridDifficultyLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('difficulty_level', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='django_jigsaw_puzzle.difficultylevel')),
            ],
        ),
        migrations.AddField(
            model_name='game',
            name='grid_difficulty_level',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='django_jigsaw_puzzle.griddifficultylevel'),
        ),
        migrations.CreateModel(
            name='ImageSetImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', filer.fields.image.FilerImageField(on_delete=django.db.models.deletion.PROTECT, to=settings.FILER_IMAGE_MODEL)),
                ('image_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='django_jigsaw_puzzle.imageset')),
            ],
        ),
        migrations.CreateModel(
            name='JigsawPuzzle',
            fields=[
                ('imagegame_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='django_jigsaw_puzzle.imagegame')),
                ('randomize_images', models.BooleanField(default=True)),
            ],
            bases=('django_jigsaw_puzzle.imagegame',),
        ),
        migrations.CreateModel(
            name='JigsawPuzzlePluginModel',
            fields=[
                ('cmsplugin_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, related_name='%(app_label)s_%(class)s', serialize=False, to='cms.cmsplugin')),
                ('jigsaw_puzzle', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='django_jigsaw_puzzle.jigsawpuzzle')),
            ],
            options={
                'abstract': False,
            },
            bases=('cms.cmsplugin',),
        ),
        migrations.AddField(
            model_name='griddifficultylevel',
            name='jigsaw_puzzle',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='django_jigsaw_puzzle.jigsawpuzzle'),
        ),
    ]
