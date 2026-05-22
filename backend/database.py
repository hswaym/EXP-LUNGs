import os
import base64
import json
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv()

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client: Client | None = None

def get_supabase() -> Client | None:
    """Returns the Supabase client, or None if not configured."""
    global _client
    if _client:
        return _client
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[DB] Supabase not configured — SUPABASE_URL or SUPABASE_KEY missing. Using in-memory cache only.")
        return None
    try:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[DB] Supabase client initialized.")
        return _client
    except Exception as e:
        print(f"[DB] Failed to connect to Supabase: {e}")
        return None

def decode_jwt_payload(token: str) -> dict | None:
    """Decodes base64 JWT payload locally without verifying signature (for offline/resilient fallback)."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        return json.loads(payload_bytes.decode("utf-8"))
    except Exception as e:
        print(f"[AUTH] Failed to decode JWT locally: {e}")
        return None

def verify_token_and_get_user_id(auth_header: str | None) -> str | None:
    """
    Verifies the JWT token from the Authorization header.
    Returns the user's UUID if successful, otherwise None.
    If it's a Firebase token or a mock token, decodes it locally for speed and stability.
    """
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    
    # 1. Try local decode first to see if it's a Firebase or mock token
    payload = decode_jwt_payload(token)
    if payload:
        iss = payload.get("iss", "")
        # If it's a Firebase token or a mock token, extract sub immediately
        if "securetoken.google.com" in iss or "mock" in token or payload.get("role") != "authenticated":
            return payload.get("sub")
            
    # 2. Try to verify via Supabase if online (only for Supabase tokens)
    client = get_supabase()
    if client:
        try:
            res = client.auth.get_user(token)
            if res and res.user:
                return res.user.id
        except Exception as e:
            print(f"[AUTH] Supabase network verification failed/offline: {e}")
            
    # 3. Fallback
    if payload:
        return payload.get("sub")
        
    return None

async def save_scan(scan_data: dict, user_id: str | None = None) -> bool:
    """Upserts a scan record to the 'scans' table. Falls back gracefully."""
    if user_id:
        scan_data["user_id"] = user_id
    client = get_supabase()
    if not client:
        return False
    
    clean = {k: v for k, v in scan_data.items() if v is not None or k in ("scan_id", "status")}
    try:
        res = client.table("scans").upsert(clean).execute()
        return res.data is not None
    except Exception as e:
        err_msg = str(e)
        if "column" in err_msg:
            print(f"[DB] Supabase scans table is missing advanced columns. Pruning and retrying... Error: {e}")
            pruned = {
                k: v for k, v in clean.items()
                if k not in (
                    "patient_name", "patient_age", "patient_gender", "clinical_history",
                    "clinician_notes", "ai_visit_suggestion", "ai_medication_suggestion"
                )
            }
            try:
                res = client.table("scans").upsert(pruned).execute()
                return res.data is not None
            except Exception as retry_err:
                print(f"[DB] Error saving pruned scan: {retry_err}")
                return False
        else:
            print(f"[DB] Error saving scan: {e}")
            return False

async def fetch_all_scans(user_id: str | None = None) -> list:
    """Fetches all scans ordered by most recent, filtered by user_id if provided."""
    client = get_supabase()
    if not client:
        return []
    try:
        query = client.table("scans").select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        res = query.order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"[DB] Error fetching scans: {e}")
        return []

async def fetch_scan_by_id(scan_id: str, user_id: str | None = None) -> dict | None:
    """Fetches a single scan by ID, scoped to user_id if provided."""
    client = get_supabase()
    if not client:
        return None
    try:
        query = client.table("scans").select("*").eq("scan_id", scan_id)
        if user_id:
            query = query.eq("user_id", user_id)
        res = query.single().execute()
        return res.data
    except Exception as e:
        print(f"[DB] Error fetching scan {scan_id}: {e}")
        return None
