from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Paper, Comment
from .permissions import IsAuthorOrReadOnly
from .serializers import PaperSerializer, CommentSerializer
import logging

logger = logging.getLogger(__name__)


class PaperViewSet(viewsets.ModelViewSet):
    serializer_class = PaperSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # Reported papers are hidden from everyone except staff moderators.
        queryset = Paper.objects.select_related('author').order_by('-uploaded_at')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_hidden=False)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='report')
    def report_paper(self, request, pk=None):
        paper = self.get_object()
        paper.is_hidden = True
        paper.save(update_fields=['is_hidden'])
        logger.info("Paper %s reported and hidden by user %s", paper.id, request.user.id)
        return Response({'status': 'paper reported and hidden', 'paper_id': paper.id})


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(paper_id=self.kwargs['paper_pk']).select_related('author')

    def perform_create(self, serializer):
        paper = get_object_or_404(Paper, pk=self.kwargs['paper_pk'], is_hidden=False)
        serializer.save(author=self.request.user, paper=paper)
