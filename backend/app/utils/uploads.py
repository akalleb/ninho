import os
import time
from fastapi import HTTPException, UploadFile


async def save_upload(file: UploadFile, directory: str, prefix: str, max_size: int, allowed_types: set[str]) -> str:
    os.makedirs(directory, exist_ok=True)
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="Arquivo muito grande")
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido")
    safe_name = os.path.basename(file.filename)
    filename = f"{prefix}_{int(time.time())}_{safe_name}"
    file_path = os.path.join(directory, filename)
    with open(file_path, "wb") as f:
        f.write(contents)
    return filename

