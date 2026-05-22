def generate_clinical_insight(condition: str, confidence: float, severity_label: str, total_inv: float) -> str:
    """Generates deep learning model explanation text."""
    conf_pct = round(confidence * 100, 1)
    
    if condition.lower() == "normal":
        return f"The model detected normal pulmonary structure with {conf_pct}% confidence. The lungs appear clear with no significant opacities, consolidation, or pleural effusion detected."
        
    base = f"Our model detected signs consistent with {condition} with a {conf_pct}% confidence interval. "
    
    if severity_label == "Severe":
        ext = f"The condition appears severe, with total lung involvement estimated at {total_inv}%. The Grad-CAM heatmap highlights dense, widespread opacities requiring immediate clinical evaluation."
    elif severity_label == "Moderate":
        ext = f"The condition appears moderately developed, involving roughly {total_inv}% of the lung area. Heatmaps indicate pronounced regional consolidation."
    else:
        ext = f"The condition is classified as mild, with {total_inv}% involvement. Early signs of targeted opacification are visible in the highlighted regions."
        
    return base + ext


def generate_visit_suggestion(condition: str, severity_label: str) -> str:
    """Determines whether a physician visit is recommended based on severity and pathology."""
    cond_lower = condition.lower()
    
    if cond_lower == "normal":
        return "No immediate doctor visit is required. Rest and monitor for any new or changing symptoms."
        
    if severity_label == "Severe":
        return (
            "CRITICAL: Immediate pulmonologist or emergency clinical consultation is highly recommended. "
            "Please visit the nearest urgent care facility or contact an emergency services team immediately."
        )
    elif severity_label == "Moderate":
        return (
            "HIGHLY ADVISED: Schedule a prompt in-person consultation with a General Practitioner or Pulmonologist. "
            "A clinical exam (chest auscultation and potential blood work) is recommended."
        )
    else:
        # Mild but not Normal
        return (
            "RECOMMENDED: Schedule a routine consultation with your General Practitioner. "
            "Early intervention helps prevent pathology progression and optimizes healing."
        )


def generate_medication_suggestion(condition: str) -> str:
    """Suggests supportive care and safe OTC medicine classes, with strict professional disclaimers."""
    cond_lower = condition.lower()
    
    if cond_lower == "normal":
        return (
            "• Hydration: Drink 2-3 liters of fluids daily.\n"
            "• Symptom Support: For minor throat or airway irritation, use saline nasal sprays or throat lozenges.\n"
            "• No therapeutic drugs or antibiotics are required."
        )
        
    elif cond_lower in ("pneumonia", "viral pneumonia"):
        return (
            "• Fever & Pain: Acetaminophen (Paracetamol) or Ibuprofen for fever control and chest discomfort.\n"
            "• Airway Support: Stay in warm, humidified environments and drink plenty of fluids.\n"
            "• WARNING: Bacterial pneumonia requires a targeted prescription antibiotic (e.g., Amoxicillin, Azithromycin) "
            "specifically prescribed by a physician. Do NOT self-medicate with leftover antibiotics."
        )
        
    elif cond_lower == "covid-19":
        return (
            "• Fever & Body Aches: Paracetamol (Acetaminophen) for body aches and fever management.\n"
            "• Cough Support: Expectorants or cough suppressants depending on cough type.\n"
            "• Antivirals: High-risk patients may qualify for prescription antivirals (e.g., Paxlovid) under physician guidance.\n"
            "• Monitoring: Consistently track oxygen saturation (SpO2) with a pulse oximeter."
        )
        
    elif cond_lower == "tuberculosis":
        return (
            "• WARNING: Tuberculosis is a highly infectious pathology that CANNOT be treated with over-the-counter medications.\n"
            "• Multi-drug Regimen: Requires a strict, long-term combination of prescription drugs (Rifampin, Isoniazid, "
            "Pyrazinamide, and Ethambutol) specifically supervised under Direct Observed Therapy (DOTS).\n"
            "• Consult an Infectious Disease specialist immediately."
        )
        
    elif cond_lower in ("lung opacity", "lung_opacity"):
        return (
            "• Diagnostic Workup: Treatment depends entirely on clarifying the etiology of the opacity (mass, atelectasis, infection).\n"
            "• Supportive: Keep airways clear, rest, and avoid respiratory irritants (tobacco smoke, pollution).\n"
            "• Do NOT take corticosteroids or antibiotics without a direct clinical diagnosis and prescription."
        )
        
    else:
        return (
            "• General Support: Focus on complete physical rest and optimal hydration.\n"
            "• Symptomatic Relief: Use over-the-counter antipyretics for fever as needed.\n"
            "• Consult your physician for a specific targeted therapeutic plan."
        )
