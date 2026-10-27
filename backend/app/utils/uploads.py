import os
import uuid
import shutil
from typing import Optional
from fastapi import UploadFile, HTTPException

from dotenv import load_dotenv

load_dotenv()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

try:
    MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))
except ValueError:
    MAX_UPLOAD_SIZE_MB = 5

MAX_FILE_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024  # Default 5 MB


def save_upload_file(
    upload_file: Optional[UploadFile],
    target_dir: str,
    allowed_extensions: set[str] = ALLOWED_EXTENSIONS,
    max_size: int = MAX_FILE_SIZE_BYTES
) -> Optional[str]:
    """
    Safely saves an uploaded file preventing path traversal, extension spoofing, and large payload DoS.
    Returns the generated unique filename or None if no file was uploaded.
    """
    if not upload_file or not upload_file.filename:
        return None

    # Check upfront size if reported by headers/spool
    if hasattr(upload_file, "size") and upload_file.size and upload_file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {max_size // (1024 * 1024)} MB"
        )

    # Strip any directory path components
    safe_basename = os.path.basename(upload_file.filename)
    _, ext = os.path.splitext(safe_basename)
    ext = ext.lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(sorted(allowed_extensions))}"
        )

    # Generate cryptographically random unique filename to prevent collisions and overwrites
    random_filename = f"{uuid.uuid4().hex}{ext}"
    os.makedirs(target_dir, exist_ok=True)
    destination = os.path.abspath(os.path.join(target_dir, random_filename))

    # Path traversal safety check
    target_dir_abs = os.path.abspath(target_dir)
    if os.path.commonpath([destination, target_dir_abs]) != target_dir_abs:
        raise HTTPException(status_code=400, detail="Invalid file destination path")

    # Read and enforce file size limits
    file_size = 0
    with open(destination, "wb") as buffer:
        while True:
            chunk = upload_file.file.read(1024 * 64)  # 64 KB chunks
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > max_size:
                # Remove partial file
                buffer.close()
                if os.path.exists(destination):
                    os.remove(destination)
                raise HTTPException(
                    status_code=400,
                    detail=f"File exceeds maximum allowed size of {max_size // (1024 * 1024)} MB"
                )
            buffer.write(chunk)

    return random_filename
