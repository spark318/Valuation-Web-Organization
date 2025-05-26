from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Paper, Comment
from .serializers import PaperSerializer, CommentSerializer
import logging

logger = logging.getLogger(__name__)

# Test endpoint to debug POST requests
@api_view(['GET', 'POST'])
@permission_classes([])  # Allow any user
def test_post_endpoint(request):
    """Simple test endpoint to debug POST requests"""
    if request.method == 'GET':
        return Response({'message': 'GET request successful', 'method': 'GET'})
    elif request.method == 'POST':
        return Response({
            'message': 'POST request successful', 
            'method': 'POST',
            'data': request.data,
            'content_type': request.content_type
        })

# Simple paper upload function for testing
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simple_paper_upload(request):
    """Simple paper upload function to test if ModelViewSet is the issue"""
    try:
        serializer = PaperSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Simple function to list papers
@api_view(['GET'])
@permission_classes([])  # Allow any user to read
def simple_paper_list(request):
    """Simple function to list papers"""
    logger.info("Executing simple_paper_list - Full Version")
    print("Executing simple_paper_list - Full Version")
    try:
        if request.user.is_authenticated and request.user.is_superuser:
            papers = Paper.objects.all()
            logger.info(f"Superuser {request.user.username} fetching all papers. Found {papers.count()} papers")
        else:
            papers = Paper.objects.filter(is_hidden=False)
            logger.info(f"User fetching non-hidden papers. Found {papers.count()} papers")
        
        serializer = PaperSerializer(papers, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in simple_paper_list: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Simple function to retrieve a single paper by ID
@api_view(['GET'])
@permission_classes([]) # Allow any user to read
def simple_paper_detail(request, paper_id):
    """Simple function to retrieve a single paper by ID"""
    try:
        paper = Paper.objects.get(pk=paper_id)
        
        # Check if paper is hidden and user is not superuser
        if paper.is_hidden and not (request.user.is_authenticated and request.user.is_superuser):
            return Response({'error': 'Paper not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = PaperSerializer(paper)
        return Response(serializer.data)
    except Paper.DoesNotExist:
        return Response({'error': 'Paper not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in simple_paper_detail for ID {paper_id}: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Create your views here.
class PaperViewSet(viewsets.ModelViewSet):
    serializer_class = PaperSerializer
    # Explicitly allow POST, GET, PUT, PATCH, DELETE, HEAD, OPTIONS
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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
