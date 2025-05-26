from django.db import models
from django.conf import settings
# Import S3Boto3Storage and instantiate it
from storages.backends.s3boto3 import S3Boto3Storage

# Define the S3 storage instance to be used for specific fields
# This instance will use the AWS settings from your settings.py
s3_media_storage = S3Boto3Storage()

class Paper(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    # Explicitly use the S3 storage instance for this field
    pdf_file = models.FileField(
        upload_to='research_papers/pdfs/', 
        storage=s3_media_storage  # Use the S3 instance
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='papers'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_hidden = models.BooleanField(default=False, help_text='Moderation flag')

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        # Delete the S3 file first
        if self.pdf_file:
            self.pdf_file.delete(save=False) # save=False to prevent saving the model again before deletion
        # Call the superclass method to delete the database record
        super().delete(*args, **kwargs)

class Comment(models.Model):
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.author} on {self.paper.title[:20]}...'

    class Meta:
        ordering = ['-created_at']
