from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Follow
from .serializers import UserProfileSerializer, FollowSerializer, UserSerializer

User = get_user_model()

class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for user profile management"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserDetailView(generics.RetrieveAPIView):
    """View to get details of any user by ID"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    """Follow a user"""
    user_to_follow = get_object_or_404(User, id=user_id)

    if user_to_follow == request.user:
        return Response(
            {'error': 'You cannot follow yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )

    _, created = Follow.objects.get_or_create(
        follower=request.user,
        followed=user_to_follow
    )

    if created:
        return Response(
            {'message': f'Successfully followed {user_to_follow.username}'},
            status=status.HTTP_201_CREATED
        )
    return Response(
        {'message': f'Already following {user_to_follow.username}'},
        status=status.HTTP_200_OK
    )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, user_id):
    """Unfollow a user"""
    user_to_unfollow = get_object_or_404(User, id=user_id)

    deleted, _ = Follow.objects.filter(
        follower=request.user,
        followed=user_to_unfollow
    ).delete()

    if deleted:
        return Response(
            {'message': f'Successfully unfollowed {user_to_unfollow.username}'},
            status=status.HTTP_200_OK
        )
    return Response(
        {'message': f'Not following {user_to_unfollow.username}'},
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_followers(request, user_id):
    """Get list of user's followers"""
    user = get_object_or_404(User, id=user_id)
    followers = Follow.objects.filter(followed=user).select_related('follower')
    serializer = FollowSerializer(followers, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_following(request, user_id):
    """Get list of users that this user is following"""
    user = get_object_or_404(User, id=user_id)
    following = Follow.objects.filter(follower=user).select_related('followed')
    serializer = FollowSerializer(following, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search for users by username or name"""
    query = request.GET.get('q', '')
    if len(query) < 2:
        return Response({'error': 'Query must be at least 2 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(
        username__icontains=query
    ).exclude(id=request.user.id)[:20]  # Limit to 20 results
    
    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)
