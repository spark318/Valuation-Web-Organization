"""
Serializers for the papers app.
"""
from rest_framework import serializers
from .models import Paper

class PaperSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Paper
        fields = ['id', 'title', 'summary', 'pdf_file', 'author', 'author_username', 'uploaded_at', 'updated_at', 'is_hidden']
        read_only_fields = ['author'] 