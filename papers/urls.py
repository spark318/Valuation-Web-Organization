from django.urls import path, include
from rest_framework_nested import routers
from .views import PaperViewSet, CommentViewSet

router = routers.DefaultRouter()
router.register('papers', PaperViewSet, basename='paper')

papers_router = routers.NestedDefaultRouter(router, 'papers', lookup='paper')
papers_router.register('comments', CommentViewSet, basename='paper-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(papers_router.urls)),
] 