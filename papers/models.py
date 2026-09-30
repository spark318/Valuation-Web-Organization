from django.db import models
from django.conf import settings

class Paper(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    # Uses the default storage: S3 when configured, local media/ otherwise (see settings.py)
    pdf_file = models.FileField(upload_to='research_papers/pdfs/')
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
        # Remove the stored file too, so deleted papers don't leave orphaned PDFs behind
        if self.pdf_file:
            self.pdf_file.delete(save=False)
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
