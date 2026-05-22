import os
import uuid
import uuid
from typing import Tuple

STATIC_DIR = "static/results"

def ensure_static_dir(scan_id: str) -> str:
    path = os.path.join(STATIC_DIR, scan_id)
    os.makedirs(path, exist_ok=True)
    return path

def generate_scan_id() -> str:
    # Example: scan-1a2b3c4
    return f"scan-{str(uuid.uuid4())[:8]}"

def get_image_url(scan_id: str, filename: str) -> str:
    return f"/static/results/{scan_id}/{filename}"
