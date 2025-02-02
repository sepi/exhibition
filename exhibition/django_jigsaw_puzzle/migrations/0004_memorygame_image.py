# Generated by Django 5.0.2 on 2025-02-02 18:33

import django.db.models.deletion
import filer.fields.image
from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('django_jigsaw_puzzle', '0003_rename_jigsaw_puzzle_jigsawpuzzlepluginmodel_game_and_more'),
        migrations.swappable_dependency(settings.FILER_IMAGE_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='memorygame',
            name='image',
            field=filer.fields.image.FilerImageField(null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.FILER_IMAGE_MODEL),
        ),
    ]
