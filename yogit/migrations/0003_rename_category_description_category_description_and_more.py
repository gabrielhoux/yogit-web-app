# Generated by Django 4.2 on 2023-04-27 16:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('yogit', '0002_category_api_id_pose_api_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='category',
            old_name='category_description',
            new_name='description',
        ),
        migrations.RenameField(
            model_name='category',
            old_name='category_name',
            new_name='name',
        ),
        migrations.RemoveField(
            model_name='category',
            name='poses',
        ),
        migrations.AddField(
            model_name='pose',
            name='yoga_category',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='yogit.category'),
            preserve_default=False,
        ),
    ]
