"""
Serializers for the papers app.
"""
from rest_framework import serializers
from .models import Paper, Comment
import boto3
from django.conf import settings

class PaperSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Paper
        fields = ['id', 'title', 'summary', 'pdf_file', 'pdf_file_url', 'author', 'author_username', 'uploaded_at', 'updated_at', 'is_hidden']
        read_only_fields = ['author']

    def get_pdf_file_url(self, obj):
        if not obj.pdf_file or not hasattr(obj.pdf_file, 'name') or not obj.pdf_file.name:
            print("DEBUG: obj.pdf_file is missing or has no name, cannot generate pre-signed URL.")
            return None
        
        # Ensure AWS settings are being loaded correctly
        aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY
        aws_s3_region_name = settings.AWS_S3_REGION_NAME
        aws_storage_bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        if not all([aws_access_key_id, aws_secret_access_key, aws_s3_region_name, aws_storage_bucket_name]):
            print("DEBUG: Missing one or more AWS S3 settings (key_id, secret_key, region, bucket_name).")
            return None

        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_s3_region_name,
            config=boto3.session.Config(signature_version='s3v4', s3={'addressing_style': 'virtual'})
        )
        try:
            # Construct the S3 key correctly, respecting AWS_LOCATION
            s3_key = obj.pdf_file.name
            if settings.AWS_LOCATION:
                s3_key = f"{settings.AWS_LOCATION.strip('/')}/{s3_key.lstrip('/')}"
            
            # Remove any potential double slashes that might result from joining, though strip/lstrip should handle most
            s3_key = s3_key.replace('//', '/')

            print(f"DEBUG: Generating presigned URL for constructed Key: '{s3_key}' in Bucket: '{aws_storage_bucket_name}'")

            url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': aws_storage_bucket_name,
                    'Key': s3_key # Use the carefully constructed key
                },
                ExpiresIn=3600  # URL expires in 1 hour (3600 seconds)
            )
            print(f"DEBUG: Generated presigned URL: {url[:100]}...") # Print start of URL
            return url
        except Exception as e:
            print(f"Error generating pre-signed URL: {e}")
            import traceback
            traceback.print_exc() # Print full traceback
            return None

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'paper', 'author', 'author_username', 'content', 'created_at', 'updated_at']
        read_only_fields = ['author', 'paper'] 