from typing import Dict, Any

# Simple in-memory dict for demonstration.
# In a real app, use Redis or a database.
_results_store: Dict[str, Any] = {}

def save_result(scan_id: str, data: dict):
    _results_store[scan_id] = data

def get_result(scan_id: str) -> dict:
    return _results_store.get(scan_id, None)
