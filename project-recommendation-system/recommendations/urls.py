from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/recommend/", views.recommend_api, name="recommend_api"),
]

