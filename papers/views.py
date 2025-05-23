from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Paper, Comment
from .serializers import PaperSerializer, CommentSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class PaperViewSet(viewsets.ModelViewSet):
    serializer_class = PaperSerializer

    def get_queryset(self):
        try:
            if self.action in ['list', 'retrieve']:
                if self.request.user.is_authenticated and self.request.user.is_superuser:
                    queryset = Paper.objects.all()
                    logger.info(
                        f"Superuser {self.request.user.id} ({self.request.user.username}) "
                        f"fetching all papers. Found {queryset.count()} papers"
                    )
                else:
                    queryset = Paper.objects.filter(is_hidden=False)
                    logger.info(
                        f"User {self.request.user.id if self.request.user.is_authenticated else 'anonymous'} "
                        f"fetching non-hidden papers. Found {queryset.count()} papers"
                    )
            else:
                # For create, update, delete actions
                queryset = Paper.objects.all()
                logger.info(
                    f"Action {self.action}: Using default queryset with {queryset.count()} papers"
                )
            return queryset
        except Exception as e:
            logger.error(f"Error in get_queryset: {str(e)}")
            return Paper.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'report']:
            self.permission_classes = [IsAuthenticated]
        else:  # list, retrieve
            self.permission_classes = [IsAuthenticatedOrReadOnly]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='report')
    def report_paper(self, request, pk=None):
        try:
            paper = self.get_object()
            if paper.is_hidden:
                return Response(
                    {'error': 'Paper is already hidden'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            paper.is_hidden = True
            paper.save()
            
            logger.info(
                f"Paper {paper.id} ({paper.title}) reported and hidden by user "
                f"{request.user.id} ({request.user.username})"
            )
            
            return Response({
                'status': 'paper reported and hidden',
                'paper_id': paper.id,
                'title': paper.title
            })
        except Exception as e:
            logger.error(f"Error reporting paper {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to report paper'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(paper_id=self.kwargs['paper_pk'])

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            paper_id=self.kwargs['paper_pk']
        )

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated]  # Only authenticated users can modify/delete
        return super().get_permissions()
