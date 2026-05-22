from fastapi import APIRouter, HTTPException, Header
from database import fetch_all_scans, fetch_scan_by_id, verify_token_and_get_user_id
from utils.cache import _results_store
from schemas.response import AnalysisResponse

router = APIRouter()

@router.get("/api/history")
async def get_scan_history(authorization: str | None = Header(None)):
    """
    Returns all historical scans for the authenticated user.
    First tries Supabase, falls back to in-memory store for the current session.
    """
    user_id = verify_token_and_get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing token")

    # Try Supabase first
    db_scans = await fetch_all_scans(user_id=user_id)
    if db_scans:
        return {"scans": db_scans, "source": "database"}
    
    # Fallback: return completed in-memory scans belonging to this user or legacy ones
    session_scans = [
        v for v in _results_store.values()
        if isinstance(v, dict) and v.get("status") == "complete" and (v.get("user_id") == user_id or v.get("user_id") is None)
    ]
    # Sort by scan_id (newest last via UUID ordering)
    session_scans.sort(key=lambda x: x.get("scan_id", ""), reverse=True)
    return {"scans": session_scans, "source": "session"}

@router.get("/api/history/{scan_id}", response_model=AnalysisResponse)
async def get_history_scan(scan_id: str, authorization: str | None = Header(None)):
    """Get a single historical scan by ID (from DB or cache)."""
    user_id = verify_token_and_get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing token")

    # Try DB first
    db_result = await fetch_scan_by_id(scan_id, user_id=user_id)
    if db_result:
        return AnalysisResponse(**db_result)
    
    # Fallback to cache
    from utils.cache import get_result
    cached = get_result(scan_id)
    if cached and cached.get("status") == "complete":
        if cached.get("user_id") == user_id or cached.get("user_id") is None:
            return AnalysisResponse(**cached)
        else:
            raise HTTPException(status_code=403, detail="Forbidden: Access to this scan is restricted")
    
    raise HTTPException(status_code=404, detail="Scan not found")
