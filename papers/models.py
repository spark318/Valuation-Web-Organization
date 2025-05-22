from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models

class Paper(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
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
