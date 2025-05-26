from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # User profile management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('<int:id>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Follow system
    path('<int:user_id>/follow/', views.follow_user, name='follow-user'),
    path('<int:user_id>/unfollow/', views.unfollow_user, name='unfollow-user'),
    path('<int:user_id>/followers/', views.user_followers, name='user-followers'),
    path('<int:user_id>/following/', views.user_following, name='user-following'),
    
    # User search
    path('search/', views.search_users, name='search-users'),
] 