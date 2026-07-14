import os
import uuid
import cloudinary
import cloudinary.uploader
import logging
from werkzeug.utils import secure_filename
from config import Config

logger = logging.getLogger(__name__)

# Initialize Cloudinary if configured
if Config.is_cloudinary_configured():
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )
    logger.info("Cloudinary configured successfully.")
else:
    logger.warning("Cloudinary not configured. Falling back to local upload system.")

def upload_image(file_storage, folder="trimtime"):
    """
    Uploads a file to Cloudinary, or falls back to local storage if Cloudinary is not configured.
    Returns: The public secure URL of the uploaded image.
    """
    if not file_storage or file_storage.filename == "":
        return None

    filename = secure_filename(file_storage.filename)
    unique_name = f"{uuid.uuid4().hex}_{filename}"

    if Config.is_cloudinary_configured():
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_storage,
                folder=folder,
                resource_type="auto"
            )
            return result.get('secure_url')
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}. Falling back to local upload.")
            # Fall back to local upload on exception

    # Local Storage Fallback
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_dir = os.path.join(base_dir, 'uploads', folder)
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_name)
    file_storage.save(file_path)
    
    # Return path relative to the server host
    # In controllers, this should be mapped with request.host_url
    return f"/uploads/{folder}/{unique_name}"
