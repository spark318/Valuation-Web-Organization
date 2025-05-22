from django.conf import settings
from papers.models import Paper

print(f"DEFAULT_FILE_STORAGE in settings: {settings.DEFAULT_FILE_STORAGE}")

try:
    from storages.backends.s3boto3 import S3Boto3Storage
    print("Successfully imported storages.backends.s3boto3.S3Boto3Storage")
except ImportError as e:
    print(f"Failed to import S3Boto3Storage: {e}")
    import sys
    print(f"Python sys.path: {sys.path}")
    # You might also want to check the location of the 'storages' package if it's found
    try:
        import storages
        print(f"Location of 'storages' package: {storages.__file__}")
    except ImportError:
        print("'storages' package not found at all.")


# Check the specific storage class on the model field if an instance exists
paper_instance = Paper.objects.order_by('id').first() # Get any paper instance, ensure consistent ordering

if paper_instance:
    print(f"Found paper instance with ID: {paper_instance.id}")
    if hasattr(paper_instance, 'pdf_file') and paper_instance.pdf_file:
        print(f"Storage for paper_instance.pdf_file: {type(paper_instance.pdf_file.storage)}")
        # If it's DefaultStorage, let's see what that class is
        if type(paper_instance.pdf_file.storage).__name__ == 'DefaultStorage':
            from django.core.files.storage import default_storage
            print(f"Type of django.core.files.storage.default_storage: {type(default_storage)}")
    elif hasattr(paper_instance, 'pdf_file') and not paper_instance.pdf_file:
        print(f"Paper instance ID {paper_instance.id} has a pdf_file field, but it is empty (no file associated).")
        # Let's still try to see what storage its field *would* use
        # This requires creating an unbound field instance or checking the model directly
        # For simplicity, we'll rely on the general settings check for now if the field is empty.
        # Alternatively, check the field on the class
        field_storage = paper_instance._meta.get_field('pdf_file').storage
        print(f"Storage for Paper.pdf_file field (from model meta): {type(field_storage)}")
    else:
        print(f"Paper instance ID {paper_instance.id} does not have a pdf_file attribute or it is None.")
else:
    print("No paper instances found in the database.")

# What if DEFAULT_FILE_STORAGE is not a string?
if not isinstance(settings.DEFAULT_FILE_STORAGE, str):
    print(f"Warning: DEFAULT_FILE_STORAGE is not a string. Its type is: {type(settings.DEFAULT_FILE_STORAGE)}") 