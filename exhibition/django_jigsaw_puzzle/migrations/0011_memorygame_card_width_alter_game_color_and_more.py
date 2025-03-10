# Generated by Django 5.0.2 on 2025-02-13 16:32

import django.db.models.deletion
import filer.fields.image
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_jigsaw_puzzle', '0010_memorygame_card_front_background_color'),
        migrations.swappable_dependency(settings.FILER_IMAGE_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='memorygame',
            name='card_width',
            field=models.CharField(default='160px', max_length=64, verbose_name='Card width in CSS units.'),
        ),
        migrations.AlterField(
            model_name='game',
            name='color',
            field=models.CharField(default='#fff', max_length=7, verbose_name='The color of the top navigation bar.'),
        ),
        migrations.AlterField(
            model_name='memorygame',
            name='card_aspect_ratio',
            field=models.CharField(default='1 / 1', max_length=64, verbose_name='Card aspect ratio. Put something that CSS aspect-ratio understands.'),
        ),
        migrations.AlterField(
            model_name='memorygame',
            name='card_back_image',
            field=filer.fields.image.FilerImageField(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='card_back_image', to=settings.FILER_IMAGE_MODEL, verbose_name='The image to show when the card is flipped'),
        ),
        migrations.AlterField(
            model_name='memorygame',
            name='card_front_background_color',
            field=models.CharField(default='#222', max_length=7, verbose_name='The color of the front of the card that is not covered by the image.'),
        ),
        migrations.AlterField(
            model_name='memorygame',
            name='card_hidden_image',
            field=filer.fields.image.FilerImageField(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='card_hidden_image', to=settings.FILER_IMAGE_MODEL, verbose_name='The image to show while the cards are being flipped on first load'),
        ),
    ]
