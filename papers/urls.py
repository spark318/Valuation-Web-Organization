from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    PaperViewSet, 
    CommentViewSet, 
    test_post_endpoint, 
    simple_paper_upload, 
    simple_paper_list, 
    simple_paper_detail
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
    # Specific simple views should come BEFORE the general router includes
    path('test-post-debug/', test_post_endpoint, name='test-post-debug'),
    path('upload/', simple_paper_upload, name='simple-upload'),
    path('list/', simple_paper_list, name='simple-list'), 
    path('detail/<int:paper_id>/', simple_paper_detail, name='simple-detail'),

    # Routers for PaperViewSet and nested CommentViewSet
    # These will handle /api/papers/, /api/papers/{pk}/, and /api/papers/{pk}/comments/
    # Any path not matched by the simple views above will fall through to these.
    path('', include(base_router.urls)),
    path('', include(papers_comments_router.urls)),
] 