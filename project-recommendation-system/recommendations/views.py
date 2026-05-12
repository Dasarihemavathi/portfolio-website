import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from recommender import recommend_projects


def index(request):
    return render(request, "index.html")


@csrf_exempt
@require_POST
def recommend_api(request):
    data = json.loads(request.body)
    return JsonResponse({"recommendations": recommend_projects(data)})
