# Generated by Django 4.2.1 on 2023-06-08 13:58

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("yogit", "0011_usersequence_description"),
    ]

    operations = [
        migrations.CreateModel(
            name="SequencePose",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("datetime", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "pose",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="yogit.pose"
                    ),
                ),
                (
                    "sequence",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="yogit.usersequence",
                    ),
                ),
            ],
        ),
        migrations.AlterField(
            model_name="usersequence",
            name="poses",
            field=models.ManyToManyField(to="yogit.sequencepose"),
        ),
    ]
