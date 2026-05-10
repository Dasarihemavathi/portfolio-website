from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/candidates/", views.candidates_api, name="candidates_api"),
    path("api/candidates/<int:candidate_id>/status/", views.status_api, name="status_api"),
    path("api/candidates/<int:candidate_id>/feedback/", views.feedback_api, name="feedback_api"),
    path("api/dashboard/", views.dashboard_api, name="dashboard_api"),
]

