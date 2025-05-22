from django.contrib import admin
from .models import Paper, Comment

# Register your models here.

class PaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'uploaded_at', 'is_hidden')
    list_filter = ('is_hidden', 'author')
    search_fields = ('title', 'summary', 'author__username') # Added search fields for better usability

class CommentAdmin(admin.ModelAdmin):
    list_display = ('paper', 'author', 'content_truncated', 'created_at')
    list_filter = ('paper', 'author')
    search_fields = ('content', 'author__username', 'paper__title')

    def content_truncated(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_truncated.short_description = 'Content'

admin.site.register(Paper, PaperAdmin)
admin.site.register(Comment, CommentAdmin)
