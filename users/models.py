from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.username
    
    def get_followers_count(self):
        """Get the number of users following this user"""
        return self.followers.count()
    
    def get_following_count(self):
        """Get the number of users this user is following"""
        return self.following.count()
    
    def is_following(self, user):
        """Check if this user is following another user"""
        return self.following.filter(followed=user).exists()

class Follow(models.Model):
    """Model to track user following relationships"""
    follower = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='following'
    )
    followed = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'followed')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"
