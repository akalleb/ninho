import os
import time
from fastapi import HTTPException, UploadFile


async def save_upload(file: UploadFile, directory: str, prefix: str, max_size: int, allowed_types: set[str]) -> str:
    os.makedirs(directory, exist_ok=True)
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido")
    safe_name = os.path.basename(file.filename)
    filename = f"{prefix}_{int(time.time())}_{safe_name}"
    file_path = os.path.join(directory, filename)
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

