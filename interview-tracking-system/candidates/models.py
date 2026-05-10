from django.db import models


class Candidate(models.Model):
    APPLIED = "Applied"
    SCREENING = "Screening"
    TECHNICAL = "Technical"
    HR = "HR"
    OFFERED = "Offered"
    HIRED = "Hired"
    REJECTED = "Rejected"

    STATUS_CHOICES = [
        (APPLIED, APPLIED),
        (SCREENING, SCREENING),
        (TECHNICAL, TECHNICAL),
        (HR, HR),
        (OFFERED, OFFERED),
        (HIRED, HIRED),
        (REJECTED, REJECTED),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    role = models.CharField(max_length=100)
    experience = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default=APPLIED)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.role}"


class Feedback(models.Model):
    candidate = models.ForeignKey(Candidate, related_name="feedback", on_delete=models.CASCADE)
    round_name = models.CharField(max_length=80)
    interviewer = models.CharField(max_length=100)
    rating = models.PositiveSmallIntegerField()
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.candidate.name} - {self.round_name}"

