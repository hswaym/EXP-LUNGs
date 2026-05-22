from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from utils.cache import get_result
from database import fetch_scan_by_id
from services.pdf_generator import generate_pdf_report

router = APIRouter()

@router.get("/api/report/{scan_id}")
async def download_pdf_report(scan_id: str):
    """
    Generates and returns a PDF clinical report for the given scan_id.
    """
    # Try cache first (fastest), then Supabase
    scan_data = get_result(scan_id)
    
    if not scan_data or scan_data.get("status") != "complete":
        scan_data = await fetch_scan_by_id(scan_id)
    
    if not scan_data:
        raise HTTPException(status_code=404, detail=f"Scan '{scan_id}' not found")
    
    if scan_data.get("status") != "complete":
        raise HTTPException(status_code=400, detail="Analysis still in progress, try again shortly.")
    
    try:
        pdf_bytes = generate_pdf_report(scan_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
    
    filename = f"explungu-report-{scan_id}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
