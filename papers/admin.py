from django.contrib import admin
from .models import Paper, Comment
from django.contrib import messages

# Register your models here.

class PaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'uploaded_at', 'is_hidden')
    list_filter = ('is_hidden', 'author')
    search_fields = ('title', 'summary', 'author__username') # Added search fields for better usability
    actions = ['mark_as_reviewed_and_visible', 'mark_as_hidden_for_review']
    list_per_page = 20  # Show 20 papers per page

    def mark_as_reviewed_and_visible(self, request, queryset):
        updated = queryset.update(is_hidden=False)
        self.message_user(
            request,
            f'{updated} paper(s) were successfully marked as reviewed and visible.',
            messages.SUCCESS
        )
    mark_as_reviewed_and_visible.short_description = "Mark selected papers as reviewed and visible"
    mark_as_reviewed_and_visible.allowed_permissions = ('change',)

    def mark_as_hidden_for_review(self, request, queryset):
        updated = queryset.update(is_hidden=True)
        self.message_user(
            request,
            f'{updated} paper(s) were successfully marked as hidden for review.',
            messages.SUCCESS
        )
    mark_as_hidden_for_review.short_description = "Mark selected papers as hidden for review"
    mark_as_hidden_for_review.allowed_permissions = ('change',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

class CommentAdmin(admin.ModelAdmin):
    list_display = ('paper', 'author', 'content_truncated', 'created_at')
    list_filter = ('paper', 'author')
    search_fields = ('content', 'author__username', 'paper__title')
    list_per_page = 20

    def content_truncated(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_truncated.short_description = 'Content'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

admin.site.register(Paper, PaperAdmin)
admin.site.register(Comment, CommentAdmin)
