"""
Serializers for the papers app.
"""
from rest_framework import serializers
from .models import Paper, Comment


class PaperSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    pdf_file = serializers.FileField(write_only=True)
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Paper
        fields = ['id', 'title', 'summary', 'pdf_file', 'pdf_file_url', 'author', 'author_username', 'uploaded_at', 'updated_at', 'is_hidden']
        read_only_fields = ['author', 'is_hidden']

    def validate_pdf_file(self, value):
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('Only PDF files are allowed.')
        return value

    def get_pdf_file_url(self, obj):
        # With S3 storage this is a pre-signed URL that expires; locally it's a /media/ path.
        if not obj.pdf_file:
            return None
        url = obj.pdf_file.url
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request and url.startswith('/') else url


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'paper', 'author', 'author_username', 'content', 'created_at', 'updated_at']
        read_only_fields = ['author', 'paper']
