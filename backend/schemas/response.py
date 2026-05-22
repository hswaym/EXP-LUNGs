from pydantic import BaseModel
from typing import Optional

class AnalysisResponse(BaseModel):
    scan_id: str
    status: str
    modality: str
    condition: Optional[str] = None
    confidence: Optional[float] = None
    severity_score: Optional[int] = None
    severity_label: Optional[str] = None
    left_lung_involvement: Optional[float] = None
    right_lung_involvement: Optional[float] = None
    total_involvement: Optional[float] = None
    grad_cam_url: Optional[str] = None
    segmented_url: Optional[str] = None
    original_url: Optional[str] = None
    mesh_url: Optional[str] = None
    clinical_insight: Optional[str] = None
    ai_visit_suggestion: Optional[str] = None
    ai_medication_suggestion: Optional[str] = None
    clinician_notes: Optional[str] = None
    processing_time_ms: Optional[int] = None
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    clinical_history: Optional[str] = None

class UploadResponse(BaseModel):
    scan_id: str
    status: str
