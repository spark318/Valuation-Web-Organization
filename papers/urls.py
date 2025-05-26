from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    PaperViewSet, 
    CommentViewSet
    # test_post_endpoint, simple_paper_upload, simple_paper_list, simple_paper_detail removed
)

app_name = 'papers'

# Base router for /api/papers/
# PaperViewSet list/create will be at /api/papers/
# PaperViewSet detail will be at /api/papers/{pk}/
base_router = routers.DefaultRouter()
base_router.register(r'', PaperViewSet, basename='paper') 

# Nested router for comments, based on the '' prefix of PaperViewSet
# This will generate /api/papers/{paper_pk}/comments/
papers_comments_router = routers.NestedDefaultRouter(base_router, r'', lookup='paper')
papers_comments_router.register(r'comments', CommentViewSet, basename='paper-comments')

urlpatterns = [
    # Commented out simple view paths removed
    path('', include(base_router.urls)),
    path('', include(papers_comments_router.urls)),
] 