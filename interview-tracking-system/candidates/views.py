import json
from decimal import Decimal

from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Candidate, Feedback


def index(request):
    return render(request, "index.html")


def candidate_payload(candidate):
    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "role": candidate.role,
        "experience": float(candidate.experience),
        "status": candidate.status,
        "created_at": candidate.created_at.isoformat(),
        "feedback": [feedback_payload(item) for item in candidate.feedback.all()],
    }


def feedback_payload(feedback):
    return {
        "id": feedback.id,
        "candidate_id": feedback.candidate_id,
        "round_name": feedback.round_name,
        "interviewer": feedback.interviewer,
        "rating": feedback.rating,
        "comments": feedback.comments,
        "created_at": feedback.created_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def candidates_api(request):
    if request.method == "GET":
        candidates = Candidate.objects.prefetch_related("feedback").order_by("-created_at")
        return JsonResponse([candidate_payload(candidate) for candidate in candidates], safe=False)

    data = json.loads(request.body)
    candidate = Candidate.objects.create(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone", ""),
        role=data["role"],
        experience=Decimal(str(data.get("experience") or 0)),
        status=data.get("status") or Candidate.APPLIED,
    )
    return JsonResponse(candidate_payload(candidate), status=201)


@csrf_exempt
@require_http_methods(["PATCH"])
def status_api(request, candidate_id):
    candidate = get_object_or_404(Candidate, pk=candidate_id)
    data = json.loads(request.body)
    candidate.status = data["status"]
    candidate.save(update_fields=["status"])
    return JsonResponse(candidate_payload(candidate))


@csrf_exempt
@require_http_methods(["POST"])
def feedback_api(request, candidate_id):
    candidate = get_object_or_404(Candidate, pk=candidate_id)
    data = json.loads(request.body)
    feedback = Feedback.objects.create(
        candidate=candidate,
        round_name=data["round_name"],
        interviewer=data["interviewer"],
        rating=int(data["rating"]),
        comments=data.get("comments", ""),
    )
    return JsonResponse(feedback_payload(feedback), status=201)


def dashboard_api(request):
    counts = {status: 0 for status, _label in Candidate.STATUS_CHOICES}
    rows = Candidate.objects.values("status").annotate(total=Count("id"))
    for row in rows:
        counts[row["status"]] = row["total"]

    return JsonResponse(
        {
            "total": sum(counts.values()),
            "active": sum(counts[status] for status in counts if status not in [Candidate.HIRED, Candidate.REJECTED]),
            "hired": counts[Candidate.HIRED],
            "rejected": counts[Candidate.REJECTED],
            "pipeline": counts,
        }
    )
