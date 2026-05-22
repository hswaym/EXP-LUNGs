import time
import cv2
import shutil
import asyncio
import os
from fastapi import APIRouter, File, UploadFile, Form, BackgroundTasks, HTTPException, Header
from fastapi.responses import StreamingResponse
from PIL import Image

from schemas.response import UploadResponse, AnalysisResponse
from services.preprocessor import preprocess_image
from services.classifier import predict_and_explain
from services.severity import segment_lung_image, calculate_severity
from services.insight import generate_clinical_insight, generate_visit_suggestion, generate_medication_suggestion
from utils.file_utils import ensure_static_dir, generate_scan_id, get_image_url
from utils.cache import save_result, get_result
from database import save_scan, verify_token_and_get_user_id

router = APIRouter()

def process_scan_background(
    scan_id: str, 
    temp_path: str, 
    user_id: str | None = None,
    patient_name: str | None = None,
    patient_age: int | None = None,
    patient_gender: str | None = None,
    clinical_history: str | None = None
):
    start_time = time.time()
    
    try:
        # [1] Preprocess Image
        rgb_img = preprocess_image(temp_path)
        
        # [2] Classifier and Grad-CAM
        condition, conf, heatmap_img = predict_and_explain(rgb_img)
        
        # [3] Segmentation and Severity
        segmented_img, left_inv, right_inv, total_inv = segment_lung_image(rgb_img)
        score, severity_label = calculate_severity(total_inv, condition)
        
        # [4] Generate Insight Text
        insight_text = generate_clinical_insight(condition, conf, severity_label, total_inv)
        visit_text = generate_visit_suggestion(condition, severity_label)
        med_text = generate_medication_suggestion(condition)
        
        # [5] Save Images to Static Folder
        static_dir = ensure_static_dir(scan_id)
        
        gradcam_path = os.path.join(static_dir, "gradcam.jpg")
        segmented_path = os.path.join(static_dir, "segmented.jpg")
        original_path = os.path.join(static_dir, "original.jpg")
        
        cv2.imwrite(gradcam_path, cv2.cvtColor(heatmap_img, cv2.COLOR_RGB2BGR))
        cv2.imwrite(segmented_path, cv2.cvtColor(segmented_img, cv2.COLOR_RGB2BGR))
        shutil.copy(temp_path, original_path)
        
        end_time = time.time()
        
        result_data = {
            "scan_id": scan_id,
            "status": "complete",
            "modality": "X-RAY",
            "condition": condition,
            "confidence": conf,
            "severity_score": score,
            "severity_label": severity_label,
            "left_lung_involvement": left_inv,
            "right_lung_involvement": right_inv,
            "total_involvement": total_inv,
            "grad_cam_url": get_image_url(scan_id, "gradcam.jpg"),
            "segmented_url": get_image_url(scan_id, "segmented.jpg"),
            "original_url": get_image_url(scan_id, "original.jpg"),
            "mesh_url": None,
            "clinical_insight": insight_text,
            "ai_visit_suggestion": visit_text,
            "ai_medication_suggestion": med_text,
            "clinician_notes": None,
            "user_id": user_id,
            "processing_time_ms": int((end_time - start_time) * 1000),
            "patient_name": patient_name,
            "patient_age": patient_age,
            "patient_gender": patient_gender,
            "clinical_history": clinical_history
        }
        
        # [6] Store in memory cache (always)
        save_result(scan_id, result_data)
        
        # [7] Persist to Supabase if configured (graceful fallback)
        asyncio.run(save_scan(result_data, user_id=user_id))
        
    except Exception as e:
        print(f"Error processing {scan_id}: {e}")
        import traceback; traceback.print_exc()
        save_result(scan_id, {"status": "error", "error": str(e)})


@router.post("/api/analyze", response_model=UploadResponse)
async def analyze_scan(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    patient_name: str | None = Form(None),
    patient_age: int | None = Form(None),
    patient_gender: str | None = Form(None),
    clinical_history: str | None = Form(None),
    authorization: str | None = Header(None)
):
    user_id = verify_token_and_get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing token")
        
    scan_id = generate_scan_id()
    
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    
    original_filename = file.filename or "upload.jpg"
    
    # Detect DICOM and save with correct extension
    from services.dicom_converter import is_dicom, convert_dicom_to_png
    if is_dicom(original_filename):
        # Save raw DCM then convert
        raw_path = os.path.join(temp_dir, f"{scan_id}.dcm")
        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Convert to PNG for the ML pipeline
        temp_path = os.path.join(temp_dir, f"{scan_id}.jpg")
        try:
            convert_dicom_to_png(raw_path, temp_path)
            print(f"[DICOM] Converted {original_filename} -> {temp_path}")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"DICOM conversion failed: {e}")
        finally:
            # Remove the raw DCM to save space
            if os.path.exists(raw_path):
                os.remove(raw_path)
    else:
        temp_path = os.path.join(temp_dir, f"{scan_id}.jpg")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    # Mark as processing
    save_result(scan_id, {"status": "processing", "user_id": user_id})
    
    # Run the heavy DL pipeline in background
    background_tasks.add_task(
        process_scan_background, 
        scan_id, 
        temp_path, 
        user_id,
        patient_name,
        patient_age,
        patient_gender,
        clinical_history
    )
    
    return UploadResponse(scan_id=scan_id, status="processing")


@router.get("/api/result/{scan_id}", response_model=AnalysisResponse)
async def get_scan_result(scan_id: str, authorization: str | None = Header(None)):
    user_id = verify_token_and_get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing token")

    result = get_result(scan_id)
    if not result:
        # Check DB fallback
        from database import fetch_scan_by_id
        db_res = await fetch_scan_by_id(scan_id, user_id=user_id)
        if db_res:
            result = db_res
        else:
            raise HTTPException(status_code=404, detail="Scan ID not found")
        
    if result.get("user_id") != user_id and result.get("user_id") is not None:
        raise HTTPException(status_code=403, detail="Forbidden: Access to this scan is restricted")
        
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Processing Failed"))
        
    if result["status"] == "processing":
        return AnalysisResponse(
            scan_id=scan_id, 
            status="processing",
            modality="unknown"
        )
        
    return AnalysisResponse(**result)

@router.get("/api/report/{scan_id}")
async def get_report_pdf(scan_id: str, authorization: str | None = Header(None)):
    """
    Generates and returns the PDF report for a given scan.
    """
    # Optional authorization: if a token is present, decode it. We allow accessing the report by scan_id without strict auth to support public share links.
    user_id = verify_token_and_get_user_id(authorization)

    result = get_result(scan_id)
    if not result:
        # Check DB fallback - fetch by scan_id directly so public share links work
        from database import fetch_scan_by_id
        db_res = await fetch_scan_by_id(scan_id)
        if db_res:
            result = db_res
            
    if not result or result["status"] != "complete":
        raise HTTPException(status_code=404, detail="Scan result not ready or not found")
    
    from services.pdf_generator import generate_pdf_report
    try:
        pdf_bytes = generate_pdf_report(result)
        from io import BytesIO
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=ExpLung-Report-{scan_id}.pdf"}
        )
    except Exception as e:
        print(f"PDF Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF report")
from pydantic import BaseModel

class ClinicianNotesRequest(BaseModel):
    notes: str

@router.post("/api/report/{scan_id}/notes")
async def save_clinician_notes(scan_id: str, request: ClinicianNotesRequest, authorization: str | None = Header(None)):
    user_id = verify_token_and_get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing token")
        
    result = get_result(scan_id)
    if not result:
        from database import fetch_scan_by_id
        db_res = await fetch_scan_by_id(scan_id, user_id=user_id)
        if db_res:
            result = db_res
        else:
            raise HTTPException(status_code=404, detail="Scan ID not found")
            
    if result.get("user_id") != user_id and result.get("user_id") is not None:
        raise HTTPException(status_code=403, detail="Forbidden: Access to this scan is restricted")
        
    result["clinician_notes"] = request.notes
    save_result(scan_id, result)
    await save_scan(result, user_id=user_id)
    
    return {"status": "success", "message": "Clinician notes saved successfully", "notes": request.notes}


from fastapi.responses import FileResponse

class VisualizeRequest(BaseModel):
    scan_id: str
    modality: str

@router.post("/api/visualize")
async def visualize_scan(request: VisualizeRequest):
    """
    Generates a 3D volumetric lung reconstruction and returns it as a binary .glb file.
    """
    scan_id = request.scan_id
    
    from services.visualizer import generate_3d_mesh_from_images
    
    try:
        glb_path = generate_3d_mesh_from_images(scan_id)
        if not os.path.exists(glb_path):
            raise HTTPException(status_code=500, detail="Generated 3D mesh GLB file was not found on disk.")
            
        return FileResponse(
            glb_path,
            media_type="application/octet-stream",
            filename=f"{scan_id}.glb",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Cache-Control": "public, max-age=3600",
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate 3D volumetric reconstruction: {str(e)}")

