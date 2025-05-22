from django.contrib import admin
from .models import Paper

# Register your models here.

class PaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'uploaded_at', 'is_hidden')
    list_filter = ('is_hidden', 'author')
    search_fields = ('title', 'summary', 'author__username') # Added search fields for better usability

admin.site.register(Paper, PaperAdmin)
