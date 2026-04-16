import os
import time
import uuid
from fastapi import HTTPException, UploadFile


async def save_upload(file: UploadFile, directory: str, prefix: str, max_size: int, allowed_types: set[str]) -> str:
    os.makedirs(directory, exist_ok=True)
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido")
    
    # Sanitize original filename to prevent path traversal
    safe_name = os.path.basename(file.filename or "upload")
    # Use UUID to prevent path traversal and filename collisions
    file_ext = os.path.splitext(safe_name)[1] if "." in safe_name else ".bin"
    # Only allow safe extensions
    safe_extensions = {".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".xls", ".xlsx"}
    if file_ext.lower() not in safe_extensions:
        raise HTTPException(status_code=400, detail="Extensão de arquivo não permitida")
    
    filename = f"{prefix}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(directory, filename)
    
    # Verify final path is within directory (defense in depth)
    abs_directory = os.path.abspath(directory)
    abs_file_path = os.path.abspath(file_path)
    if not abs_file_path.startswith(abs_directory):
        raise HTTPException(status_code=400, detail="Nome de arquivo inválido")
    
    size = 0
    with open(file_path, "wb") as f:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_size:
                try:
                    f.close()
                finally:
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                raise HTTPException(status_code=400, detail="Arquivo muito grande")
            f.write(chunk)
    return filename

