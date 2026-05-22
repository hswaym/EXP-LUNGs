import os
from io import BytesIO
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image as RLImage, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


def generate_pdf_report(scan_data: dict) -> bytes:
    """
    Generates a clinical-grade PDF report for a scan result.
    Returns the PDF as bytes.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    W, H = A4

    # --- Custom Styles ---
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=28,
        textColor=colors.HexColor("#0D0D0D"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#888888"),
        spaceAfter=12,
    )
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#333333"),
        spaceBefore=12,
        spaceAfter=4,
        borderPadding=(0, 0, 2, 0),
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#1A1A1A"),
    )
    mono_style = ParagraphStyle(
        "Mono",
        parent=styles["Normal"],
        fontSize=8,
        fontName="Courier",
        textColor=colors.HexColor("#555555"),
    )

    # --- Data — None-safe coercions for Supabase fields ---
    scan_id = str(scan_data.get("scan_id") or "N/A").upper()
    condition = str(scan_data.get("condition") or "Unknown")
    confidence = float(scan_data.get("confidence") or 0.0)
    severity_score = int(scan_data.get("severity_score") or 0)
    severity_label = str(scan_data.get("severity_label") or "Unknown")
    left_inv = float(scan_data.get("left_lung_involvement") or 0.0)
    right_inv = float(scan_data.get("right_lung_involvement") or 0.0)
    total_inv = float(scan_data.get("total_involvement") or 0.0)
    insight = str(scan_data.get("clinical_insight") or "No clinical insight available.")
    processing_ms = int(scan_data.get("processing_time_ms") or 0)
    modality = str(scan_data.get("modality") or "X-RAY")
    report_date = datetime.now().strftime("%B %d, %Y — %H:%M")

    patient_name = str(scan_data.get("patient_name") or "Anonymous").strip()
    patient_age = str(scan_data.get("patient_age") or "N/A").strip()
    patient_gender = str(scan_data.get("patient_gender") or "N/A").strip()
    clinical_history = str(scan_data.get("clinical_history") or "No clinical history provided.").strip()

    severity_colors = {
        "Normal": "#16a34a",
        "Mild": "#d97706",
        "Moderate": "#ea580c",
        "Severe": "#dc2626",
    }
    severity_hex = severity_colors.get(severity_label, "#555555")


    # --- PDF Story ---
    story = []

    # Header bar via table
    header_data = [[
        Paragraph("<b>EXPLUNGУ</b>", ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=14, textColor=colors.white)),
        Paragraph(f"AI DIAGNOSTIC REPORT<br/><font size=8 color='#AAAAAA'>{report_date}</font>",
                  ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=10, textColor=colors.white, alignment=TA_RIGHT)),
    ]]
    header_table = Table(header_data, colWidths=[85 * mm, 85 * mm])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0D0D0D")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, -1), 6 * mm),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 6 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5 * mm),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6 * mm))

    # Patient Demographics
    story.append(Paragraph("PATIENT RECORD", section_header_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
    story.append(Spacer(1, 2 * mm))

    patient_data = [
        ["Full Name", patient_name, "Age / Gender", f"{patient_age} / {patient_gender}"],
        ["Clinical History", Paragraph(clinical_history, body_style), "", ""],
    ]
    patient_table = Table(patient_data, colWidths=[30 * mm, 60 * mm, 30 * mm, 50 * mm])
    patient_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#888888")),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor("#888888")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ("SPAN", (1, 1), (3, 1)), # Span the history across remaining columns
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#EEEEEE")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
    ]))
    story.append(patient_table)
    story.append(Spacer(1, 5 * mm))

    # Scan Metadata
    story.append(Paragraph("SCAN INFORMATION", section_header_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
    story.append(Spacer(1, 2 * mm))

    meta_data = [
        ["Scan ID", scan_id, "Modality", modality],
        ["Report Date", report_date, "Processing Time", f"{processing_ms / 1000:.2f}s"],
    ]
    meta_table = Table(meta_data, colWidths=[30 * mm, 60 * mm, 30 * mm, 50 * mm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#888888")),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor("#888888")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#EEEEEE")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 5 * mm))

    # Primary Findings
    story.append(Paragraph("AI FINDINGS", section_header_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
    story.append(Spacer(1, 2 * mm))

    findings_data = [
        [Paragraph("<b>Primary Condition</b>", body_style),
         Paragraph(f"<b><font color='{severity_hex}'>{condition}</font></b>", body_style)],
        [Paragraph("<b>Model Confidence</b>", body_style),
         Paragraph(f"{confidence * 100:.1f}%", body_style)],
        [Paragraph("<b>Severity Score</b>", body_style),
         Paragraph(f"<font color='{severity_hex}'><b>{severity_score}/100 — {severity_label}</b></font>", body_style)],
        [Paragraph("<b>Total Lung Involvement</b>", body_style),
         Paragraph(f"{total_inv}%", body_style)],
        [Paragraph("<b>Left Lung Involvement</b>", body_style),
         Paragraph(f"{left_inv}%", body_style)],
        [Paragraph("<b>Right Lung Involvement</b>", body_style),
         Paragraph(f"{right_inv}%", body_style)],
    ]
    findings_table = Table(findings_data, colWidths=[70 * mm, 100 * mm])
    findings_table.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#EEEEEE")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
    ]))
    story.append(findings_table)
    story.append(Spacer(1, 5 * mm))

    # Clinical Insight
    story.append(Paragraph("CLINICAL INSIGHT", section_header_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
    story.append(Spacer(1, 2 * mm))

    insight_box_data = [[Paragraph(insight, body_style)]]
    insight_box = Table(insight_box_data, colWidths=[170 * mm])
    insight_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0F7FF")),
        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor("#3B82F6")),
    ]))
    story.append(insight_box)
    story.append(Spacer(1, 5 * mm))

    # --- Clinician Notes Section ---
    clinician_notes = scan_data.get("clinician_notes")
    if clinician_notes and str(clinician_notes).strip():
        story.append(Paragraph("CLINICIAN DIAGNOSTIC ANNOTATIONS", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
        story.append(Spacer(1, 2 * mm))
        notes_box_data = [[Paragraph(str(clinician_notes).strip().replace("\n", "<br/>"), body_style)]]
        notes_box = Table(notes_box_data, colWidths=[170 * mm])
        notes_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FCF9F2")),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor("#D97706")),
        ]))
        story.append(notes_box)
        story.append(Spacer(1, 5 * mm))

    # --- AI Medical Guidance & Recommendations Section ---
    ai_visit = scan_data.get("ai_visit_suggestion")
    ai_med = scan_data.get("ai_medication_suggestion")
    if (ai_visit and str(ai_visit).strip()) or (ai_med and str(ai_med).strip()):
        story.append(Paragraph("AI MEDICAL GUIDANCE & SUPPORTIVE CARE", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
        story.append(Spacer(1, 2 * mm))
        
        guidance_text = ""
        if ai_visit and str(ai_visit).strip():
            guidance_text += f"<b>Urgency Assessment:</b> {str(ai_visit).strip()}<br/><br/>"
        if ai_med and str(ai_med).strip():
            # Format bullet points beautifully in ReportLab Paragraph with custom tags
            formatted_meds = str(ai_med).strip().replace("\n", "<br/>")
            guidance_text += f"<b>Supportive Care & Over-the-Counter Guidelines:</b><br/>{formatted_meds}"
            
        guidance_box_data = [[Paragraph(guidance_text, body_style)]]
        guidance_box = Table(guidance_box_data, colWidths=[170 * mm])
        guidance_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
            ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ("LINEBEFORE", (0, 0), (0, -1), 3, colors.HexColor("#16A34A")),
        ]))
        story.append(guidance_box)
        story.append(Spacer(1, 5 * mm))

    # --- Side-by-side Diagnostic Images ---
    diag_flowables = [
        Paragraph("DIAGNOSTIC IMAGING & NEURAL ATTENTION MAP", section_header_style),
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")),
        Spacer(1, 4 * mm)
    ]

    possible_roots = [
        "",
        "backend",
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ]
    orig_path = None
    heat_path = None
    scan_id_val = str(scan_data.get("scan_id") or "").lower().strip()

    for root in possible_roots:
        if root:
            p_orig = os.path.join(root, "static", "results", scan_id_val, "original.jpg")
            p_heat = os.path.join(root, "static", "results", scan_id_val, "gradcam.jpg")
        else:
            p_orig = os.path.join("static", "results", scan_id_val, "original.jpg")
            p_heat = os.path.join("static", "results", scan_id_val, "gradcam.jpg")
        
        if os.path.exists(p_orig) and os.path.exists(p_heat):
            orig_path = p_orig
            heat_path = p_heat
            break

    if orig_path and heat_path:
        img_w = 70 * mm
        img_h = 70 * mm
        orig_img = RLImage(orig_path, width=img_w, height=img_h)
        heat_img = RLImage(heat_path, width=img_w, height=img_h)
        
        img_table_data = [
            [orig_img, heat_img],
            [
                Paragraph("<b>Figure A:</b> Source Scan Image", ParagraphStyle("fig_lbl", parent=body_style, alignment=TA_CENTER, fontSize=8, textColor=colors.HexColor("#666666"))),
                Paragraph("<b>Figure B:</b> Grad-CAM Attention Heatmap", ParagraphStyle("fig_lbl2", parent=body_style, alignment=TA_CENTER, fontSize=8, textColor=colors.HexColor("#666666")))
            ]
        ]
        
        img_table = Table(img_table_data, colWidths=[85 * mm, 85 * mm])
        img_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 2 * mm),
            ("TOPPADDING", (0, 1), (-1, 1), 1 * mm),
        ]))
        diag_flowables.append(img_table)
        diag_flowables.append(Spacer(1, 5 * mm))
    else:
        diag_flowables.append(Paragraph("<i>Diagnostic scan and Grad-CAM images were not resolved for this report.</i>", body_style))
        diag_flowables.append(Spacer(1, 5 * mm))

    story.append(KeepTogether(diag_flowables))

    # Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E5E5")))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        "<b>DISCLAIMER:</b> This report is generated by an AI system (ExpLung-U) for research and educational purposes only. "
        "It is NOT a substitute for professional medical diagnosis. Always consult a qualified radiologist or physician.",
        ParagraphStyle("disc", parent=styles["Normal"], fontSize=7, textColor=colors.HexColor("#999999"), leading=10)
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
