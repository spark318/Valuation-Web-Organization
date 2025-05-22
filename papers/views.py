from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Paper, Comment
from .serializers import PaperSerializer, CommentSerializer

# Create your views here.
class PaperViewSet(viewsets.ModelViewSet):
    queryset = Paper.objects.all()
    serializer_class = PaperSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated] # For now, only authenticated users can CUD
                                                    # TODO: Implement IsOwnerOrReadOnly for update/destroy
        else: # list, retrieve
            self.permission_classes = [IsAuthenticatedOrReadOnly]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

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
