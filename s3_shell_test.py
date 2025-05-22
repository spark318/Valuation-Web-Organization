from django.core.files.base import ContentFile
from papers.models import Paper # Make sure papers.models is correct
from django.contrib.auth import get_user_model
from django.conf import settings
import traceback # Ensure this is imported

# It's good practice to ensure Django is set up if running scripts standalone,
# but since we'll run this *via* manage.py shell or exec within it,
# Django's settings should already be configured.

def test_s3_upload():
    User = get_user_model()
    user = User.objects.first()

    if not user:
        print("No users found. Please create a user first. You can do this via 'python manage.py createsuperuser' or through your app's registration.")
        return

    print(f"Attempting upload with user: {user.username}")
    
    dummy_content = b"This is a test PDF content from function."
    dummy_file = ContentFile(dummy_content, name="test_from_function.pdf")
    print(f"Dummy file created: {dummy_file.name}")

    try:
        print("Creating Paper object...")
        paper = Paper(
            title="Function Upload Test via File",
            summary="Testing S3 upload from a function in a file.",
            author=user,
            pdf_file=dummy_file
        )
        print("Paper object instantiated. Saving...")
        paper.save()
        
        print("Paper.save() completed.")
        print(f"Paper object created. ID: {paper.id}")
        
        if hasattr(paper.pdf_file, 'name'):
            print(f"pdf_file.name after save: {paper.pdf_file.name}")
        else:
            print("pdf_file.name attribute does not exist.")

        if hasattr(paper.pdf_file, 'url'):
            print(f"pdf_file.url after save: {paper.pdf_file.url}")
        else:
            print("pdf_file.url attribute does not exist.")

        if hasattr(paper.pdf_file, 'storage'):
            print(f"Storage backend: {type(paper.pdf_file.storage)}")
            if hasattr(paper.pdf_file.storage, 'bucket_name'):
                 print(f"Target S3 Bucket from storage: {paper.pdf_file.storage.bucket_name}")
            else:
                print("Storage does not have bucket_name attribute (might not be S3Boto3Storage or similar).")
        else:
            print("pdf_file.storage attribute does not exist.")

        print("\nNOW, PLEASE MANUALLY CHECK your AWS S3 bucket via the AWS Console.")
        print(f"Look for the file: research_papers/pdfs/test_from_function.pdf")
        print(f"In bucket: {settings.AWS_STORAGE_BUCKET_NAME}")

    except Exception as e:
        print(f"An error occurred during the test_s3_upload function: {e}")
        traceback.print_exc()

# Call the function when the script is executed
# Ensure this part is not inside the test_s3_upload function
if __name__ == '__main__': 
    print("Executing s3_shell_test.py content directly (this part won't run with exec(open().read()))...")
    # To make it run with exec, the call should be outside __main__ or __main__ check removed for this simple script
    # For simplicity with exec(open().read()) in shell, let's just call it.
    # If you were running `python manage.py runscript s3_shell_test`, then __main__ would be different.

test_s3_upload() # Call the function directly at the end for exec(open().read()) 