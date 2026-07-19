import os
import uuid
import logging
from flask import request

logger = logging.getLogger(__name__)

# Try importing boto3 for S3 uploads
try:
    import boto3
    HAS_BOTO3 = True
except ImportError:
    HAS_BOTO3 = False

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_S3_BUCKET_NAME = os.getenv('AWS_S3_BUCKET_NAME', 'trimtime-salon-media')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')

def upload_to_s3(file_obj, folder='general'):
    """
    Uploads file to AWS S3 bucket (for shop photos, male/female hairstyles, hair treatments, facials, and staff photos).
    Falls back to local file storage if AWS S3 credentials are not configured.
    """
    if not file_obj or file_obj.filename == '':
        return None

    filename = f"{uuid.uuid4().hex}_{file_obj.filename.replace(' ', '_')}"

    # Attempt S3 upload if configured
    if HAS_BOTO3 and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_REGION
            )

            s3_key = f"uploads/{folder}/{filename}"
            s3_client.upload_fileobj(
                file_obj,
                AWS_S3_BUCKET_NAME,
                s3_key,
                ExtraArgs={'ContentType': file_obj.content_type or 'image/jpeg'}
            )

            s3_url = f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            logger.info(f"Successfully uploaded {filename} to S3 bucket: {s3_url}")
            return s3_url
        except Exception as e:
            logger.error(f"S3 upload error: {e}. Falling back to local storage.")

    # Local storage fallback
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_dir = os.path.join(base_dir, 'uploads', folder)
        os.makedirs(upload_dir, exist_ok=True)

        local_path = os.path.join(upload_dir, filename)
        file_obj.seek(0)
        file_obj.save(local_path)

        local_url = f"/uploads/{folder}/{filename}"
        logger.info(f"Saved file locally: {local_url}")
        return local_url
    except Exception as e:
        logger.error(f"Local file save error: {e}")
        return None
