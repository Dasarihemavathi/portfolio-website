from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Candidate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("role", models.CharField(max_length=100)),
                ("experience", models.DecimalField(decimal_places=1, default=0, max_digits=4)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Applied", "Applied"),
                            ("Screening", "Screening"),
                            ("Technical", "Technical"),
                            ("HR", "HR"),
                            ("Offered", "Offered"),
                            ("Hired", "Hired"),
                            ("Rejected", "Rejected"),
                        ],
                        default="Applied",
                        max_length=40,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Feedback",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("round_name", models.CharField(max_length=80)),
                ("interviewer", models.CharField(max_length=100)),
                ("rating", models.PositiveSmallIntegerField()),
                ("comments", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "candidate",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="feedback",
                        to="candidates.candidate",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

