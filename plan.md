# ExpLung-U — Master Development Prompt
**Version 2.0 | Full-Stack Extension & Scalability Brief**

---

## 🧠 PROJECT IDENTITY

**Project Name:** ExpLung-U  
**Full Title:** ExpLung-U: Explainable Lung Abnormality Detection and Severity Analysis Using Deep Learning  
**Team:** SY CS-E, Group 12 — VIT (Vishwakarma Institute of Technology)  
**Guide:** Prof. (Dr.) Sangita Lade  
**Academic Year:** 2025–26, SEM-IV  

**Core Mission:** Build a clinically trustworthy, explainable AI system that detects lung abnormalities from X-ray and CT images, quantifies severity, and presents results in a way doctors can understand, trust, and act on.

---

## 🗂️ EXISTING SYSTEM SUMMARY (What Is Already Built)

### Phase 1 — Interactive Medical Atlas (`/explore` route)
- Next.js + React + Tailwind CSS + Framer Motion
- Interactive educational dashboard: bronchial tree, alveoli counts, SpirometrySimulator, CirculatoryFlow, BreathingParticles
- Disease visualization: COPD, Asthma, Lung Cancer progression; WorldDiseaseMap, DiseaseCarousel

### Phase 2 — Cinematic Launch Page (`/` route)
- Custom HTML5 Canvas scroll-animation engine: `LaunchCanvas.tsx` + `useImageSequence.ts`
- Preloads & scrubs 240 high-resolution frames (`public/scroll/ezgif-frame-...png`) for 3D opening animation
- LRU smart memory caching (Lookahead/Lookbehind) to prevent browser crashes
- `LivingBackground.tsx` — continuous pulsing lung after 8-second intro
- Components: Navbar, Hero ("THE HUMAN LUNG ATLAS"), `EmailCapture.tsx`, `LaunchStatBar.tsx`, `WhatsInsideCards.tsx`

### Phase 3 — Light Theme (Current State)
- Full light-mode overhaul: `#FDFBF7` off-white base, Crimson / Warm Orange / Cobalt Blue accents
- Expanded spacing, frosted glassmorphism cards, soft drop-shadows
- Running on `localhost:3000`

---

## 🎯 WHAT TO BUILD NEXT — THE FULL EXPLUNG-U SYSTEM

You are extending this existing application into a **complete, production-grade AI-powered clinical tool**. Every new feature must:
1. Match the premium, airy light-theme aesthetic already established
2. Be fully componentized and independently importable
3. Use TypeScript with strict types throughout
4. Be performant (lazy-load heavy components, use dynamic imports for ML-heavy pages)
5. Follow the routing structure: `/` (launch), `/explore` (atlas), `/analyze` (NEW AI tool), `/about` (NEW)

---

## 🏗️ ARCHITECTURE TO IMPLEMENT

### Route Map
```
/                   → Cinematic Launch Page (existing, keep)
/explore            → Interactive Medical Atlas (existing, keep)
/analyze            → NEW: AI Diagnosis Tool (core deliverable)
/analyze/result/:id → NEW: Per-scan result detail page
/about              → NEW: Project info, team, methodology
```

### Frontend Stack (extend, do not replace)
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + CSS Variables for theme tokens
- **Animation:** Framer Motion (already installed)
- **3D/Vis:** Three.js (for 3D lung viewer), Plotly.js (for charts)
- **State:** Zustand (add this) for global scan/result state
- **File Upload:** react-dropzone
- **HTTP:** Axios with interceptors for API calls

### Backend Stack (build fresh)
- **Runtime:** Python 3.11 + FastAPI
- **ML Framework:** PyTorch + torchvision
- **Segmentation:** U-Net / nnU-Net (pretrained weights, fine-tuned on NIH ChestX-ray14)
- **Classification:** ResNet-50 / EfficientNet-B4 (pretrained, fine-tuned)
- **Explainability:** Grad-CAM via TorchCAM / Captum
- **3D Processing:** SimpleITK (DICOM/NIfTI), PyVista
- **Image Ops:** OpenCV, Pillow, NumPy
- **API Docs:** Auto-generated via FastAPI /docs
- **CORS:** Allow Next.js dev origin

---

## 📐 COMPONENT SPECIFICATIONS

### 1. `/analyze` — AI Diagnosis Page

#### `ImageUploader.tsx`
```
- Drag-and-drop zone supporting: .jpg, .png, .dcm, .nii, .nii.gz
- Real-time file preview (thumbnail for X-ray, slice preview for CT)
- File type badge (X-RAY / CT) auto-detected from extension
- File size validation (max 50MB)
- Animated upload progress ring
- Glassmorphism card style matching existing theme
- On upload complete → POST to /api/analyze → navigate to /analyze/result/:scanId
```

#### `AnalysisLoader.tsx`
```
- Shown during API processing (typically 3–15 seconds)
- Animated pipeline visualization showing 6 stages:
  [Upload] → [Preprocess] → [Segment] → [Classify] → [Severity] → [Explain]
- Each stage lights up sequentially with a pulsing glow (Crimson accent)
- Lung silhouette slowly fills with color as stages complete
- Estimated time remaining counter
- DO NOT use a generic spinner — this must feel medical-grade and purposeful
```

#### `ResultDashboard.tsx` (main result view at `/analyze/result/:id`)
```
Layout: Two-column on desktop, stacked on mobile

LEFT PANEL — Image Viewer:
  - Tab switcher: [Original] [Segmented] [Grad-CAM Overlay] [3D View]
  - Original: Clean display of the uploaded scan
  - Segmented: U-Net lung mask overlaid in translucent Cobalt Blue
  - Grad-CAM: Heatmap overlay (cool-to-warm colorscale) showing model attention
  - 3D View: Three.js volumetric render (pseudo-3D for X-ray, true 3D for CT)
  - All tabs: zoom, pan, brightness/contrast sliders

RIGHT PANEL — Clinical Report:
  - SeverityGauge.tsx (see below)
  - DetectionBadge: pill showing detected condition (Pneumonia / TB / COVID-19 / Nodule / Normal) with confidence %
  - AffectedAreaBar: horizontal bar "Lung Involvement: 34%" 
  - RegionBreakdown: Left lung vs Right lung involvement percentages
  - GradCAMExplanation: plain-English text auto-generated explaining what the model focused on
  - DownloadReport button → generates PDF report
```

#### `SeverityGauge.tsx`
```
- Circular arc gauge (0–100 severity score)
- Color zones: 0-25 (Mint/Normal), 26-50 (Amber/Mild), 51-75 (Orange/Moderate), 76-100 (Crimson/Severe)
- Animated needle sweep on mount
- Large numeric score in center with label (e.g., "Moderate — 62")
- Sub-label: "Based on affected lung area and abnormality density"
```

#### `3DLungViewer.tsx`
```
- Three.js canvas, WebGL renderer
- For X-ray: pseudo-3D effect using depth-map estimation + parallax on mouse move
- For CT: true volumetric rendering using stacked slices as a 3D texture
- Controls: OrbitControls (rotate, zoom)
- Toggle: [Wireframe] [Solid] [Heatmap Overlay]
- Hotspot markers on detected abnormal regions (clickable, shows tooltip with severity)
- Responsive: collapses to 2D on mobile
```

#### `ClinicalInsightCard.tsx`
```
- Plain-language explanation of findings (generated by rule-based template engine + model output)
- Format:
  "Our model detected signs consistent with [CONDITION] in the [REGION] region of the lung.
   The affected area represents approximately [X]% of total lung volume.
   Key visual indicators are highlighted in the Grad-CAM overlay."
- "What this means" expandable section (layperson explanation)
- "For the clinician" expandable section (technical details: model confidence, features activated)
- Disclaimer: "This is an AI-assisted analysis. Always consult a qualified radiologist."
```

---

### 2. `/explore` — Extend Existing Atlas

Add these new sections to the existing interactive atlas:

#### `DiseaseProgressionTimeline.tsx`
```
- Horizontal scrolling timeline for Pneumonia, TB, COVID-19, Lung Cancer
- Each stage: thumbnail X-ray mockup + short description + key symptoms
- Click stage → animated zoom into affected region with callouts
```

#### `ComparativeAnalysis.tsx`
```
- Side-by-side: Normal lung vs Diseased lung (X-ray style)
- Slider divider the user can drag to reveal/hide the overlay
- Labels auto-position based on slider location
```

#### `StatisticsGlobe.tsx`
```
- Three.js globe showing global lung disease prevalence
- Dots glow on affected regions, scaled by case count
- Hover → country name + stats tooltip
- Data sourced from WHO 2024 estimates (hardcode the top 30 countries)
```

---

### 3. FastAPI Backend (`/backend`)

#### File Structure
```
backend/
  main.py              ← FastAPI app, CORS, router registration
  routers/
    analyze.py         ← POST /api/analyze, GET /api/result/:id
    health.py          ← GET /api/health
  services/
    preprocessor.py    ← resize, normalize, denoise
    segmentor.py       ← U-Net/nnU-Net inference → lung mask
    classifier.py      ← ResNet/EfficientNet → disease class + confidence
    severity.py        ← rule-based severity score from mask + classification
    explainer.py       ← Grad-CAM heatmap generation
    visualizer.py      ← 3D mesh generation for CT
    report_gen.py      ← PDF report generation (ReportLab)
  models/
    unet.py            ← U-Net architecture definition
    classifier.py      ← CNN classifier architecture
  schemas/
    request.py         ← Pydantic models for API input
    response.py        ← Pydantic models for API output
  utils/
    image_utils.py     ← OpenCV helpers
    dicom_reader.py    ← SimpleITK DICOM/NIfTI reader
    cache.py           ← In-memory result cache (use Redis in prod)
  weights/             ← .pth model weight files (gitignored)
  temp/                ← Temporary scan uploads (auto-cleaned)
```

#### API Contract

**POST `/api/analyze`**
```json
Request: multipart/form-data
  file: <binary image>
  modality: "xray" | "ct"

Response 200:
{
  "scan_id": "uuid-v4",
  "status": "processing"
}
```

**GET `/api/result/:scan_id`**
```json
Response 200:
{
  "scan_id": "string",
  "status": "complete" | "processing" | "failed",
  "modality": "xray" | "ct",
  "condition": "Pneumonia" | "Tuberculosis" | "COVID-19" | "Nodule" | "Normal",
  "confidence": 0.94,
  "severity_score": 62,
  "severity_label": "Moderate",
  "left_lung_involvement": 28.4,
  "right_lung_involvement": 39.1,
  "total_involvement": 33.7,
  "grad_cam_url": "/static/results/{scan_id}/gradcam.png",
  "segmented_url": "/static/results/{scan_id}/segmented.png",
  "original_url": "/static/results/{scan_id}/original.png",
  "mesh_url": "/static/results/{scan_id}/mesh.glb",
  "clinical_insight": "string",
  "processing_time_ms": 4230
}
```

---

### 4. PDF Report Generator

When user clicks "Download Report":
- Triggered via GET `/api/report/:scan_id`
- PDF contains:
  - Header: ExpLung-U logo + patient scan timestamp
  - Section 1: Original scan + Grad-CAM overlay side by side
  - Section 2: Detection result, confidence, severity gauge (rendered as vector)
  - Section 3: Region-wise breakdown table (Left / Right / Total)
  - Section 4: Clinical Insight text
  - Section 5: Methodology note + disclaimer
  - Footer: "Generated by ExpLung-U | AI-Assisted Analysis | Not a substitute for clinical diagnosis"
- Use ReportLab (Python) server-side
- Return as `application/pdf` with `Content-Disposition: attachment`

---

## 🎨 DESIGN SYSTEM (Extend Existing)

### Color Tokens (add to existing CSS variables)
```css
:root {
  /* Existing */
  --bg-primary: #FDFBF7;
  --accent-crimson: #DC143C;
  --accent-orange: #E8651A;
  --accent-cobalt: #1A5CD8;

  /* NEW — Severity Scale */
  --severity-normal: #10B981;   /* Emerald */
  --severity-mild: #F59E0B;     /* Amber */
  --severity-moderate: #F97316; /* Orange */
  --severity-severe: #DC2626;   /* Red */

  /* NEW — Medical UI */
  --glass-bg: rgba(253, 251, 247, 0.75);
  --glass-border: rgba(26, 92, 216, 0.12);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --medical-grid: rgba(26, 92, 216, 0.04);
}
```

### Typography Extensions
```
- Headings (existing display font): Keep whatever is already in use
- NEW: Monospace data font for clinical numbers → `font-mono` (already in Tailwind)
- NEW: Medical labels → small-caps, tracked, muted color
- Severity scores: tabular-nums, bold, large (4xl–6xl)
```

### Micro-interaction Standards
```
- All interactive cards: subtle scale(1.02) on hover, 200ms ease
- Buttons: slight Y translate on press (-1px), shadow collapse
- Tab switches: sliding underline indicator (not instant swap)
- Data reveals: count-up animation for all numeric values (1.2s ease-out)
- Tooltips: fade + 4px Y offset, 150ms delay
- Page transitions: shared layout animations via Framer Motion layoutId
```

---

## 📦 SCALABILITY REQUIREMENTS

### Frontend Scalability
```
1. Dynamic Imports: Lazy-load Three.js viewer, Plotly charts — never in initial bundle
   import dynamic from 'next/dynamic'
   const ThreeDViewer = dynamic(() => import('@/components/3DLungViewer'), { ssr: false })

2. Image Optimization: All scan images served via Next.js <Image> with blur placeholder

3. State Management (Zustand):
   useScanStore:
     - currentScanId: string | null
     - resultCache: Map<string, ResultResponse>
     - isAnalyzing: boolean
     - setResult(), clearResult(), fetchResult()

4. API Layer (lib/api.ts):
   - Axios instance with base URL from env var NEXT_PUBLIC_API_URL
   - Request/response interceptors for error normalization
   - Retry logic (3 attempts, exponential backoff) for GET /result polling

5. Polling Strategy for Results:
   - Poll GET /api/result/:id every 2s while status === "processing"
   - Max 60s timeout → show error state
   - Use SWR or React Query for this (add one of these)
```

### Backend Scalability
```
1. Async FastAPI: All inference endpoints must be async with BackgroundTasks
2. Result Caching: Cache completed results in-memory (or Redis) by scan_id for 24h
3. Model Loading: Load models once at startup (lifespan event), not per-request
4. Temp File Cleanup: Background task to delete temp files >1h old
5. Rate Limiting: 10 requests/minute per IP (use slowapi)
6. Health Check: GET /api/health returns model load status + GPU availability
7. Environment Config: All secrets/paths via .env (pydantic-settings)
```

---

## 🔬 ML PIPELINE DETAIL

### Step 1 — Preprocessing (`preprocessor.py`)
```python
- Load image (PIL for X-ray, SimpleITK for CT/DICOM/NIfTI)
- Resize to 512×512 (X-ray) or extract axial slice stack (CT)
- Normalize: mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225] (ImageNet stats)
- CLAHE enhancement for low-contrast scans
- Gaussian blur (sigma=0.5) for noise reduction
- Convert to torch.Tensor, add batch dim
```

### Step 2 — Segmentation (`segmentor.py`)
```python
- Model: U-Net with EfficientNet-B4 encoder (pretrained on NIH ChestX-ray14)
- Input: preprocessed tensor [1, 3, 512, 512]
- Output: binary mask [1, 1, 512, 512] (1=lung, 0=background)
- Post-process: threshold at 0.5, morphological closing to fill holes
- Save: segmented PNG with translucent blue overlay
```

### Step 3 — Classification (`classifier.py`)
```python
- Model: EfficientNet-B4 fine-tuned, 5-class output:
  [Normal, Pneumonia, Tuberculosis, COVID-19, Nodule]
- Input: segmented lung crop (masked background removed)
- Output: softmax probabilities → top prediction + confidence
- Threshold: if max_confidence < 0.55 → return "Inconclusive"
```

### Step 4 — Severity Quantification (`severity.py`)
```python
- Compute: affected_pixels / total_lung_pixels × 100 = involvement %
- Severity score (0–100):
    involvement 0–5%   → score 0–25  (Normal)
    involvement 5–20%  → score 25–50 (Mild)
    involvement 20–50% → score 50–75 (Moderate)
    involvement >50%   → score 75–100 (Severe)
- Split by left/right lung using vertical midline of lung mask
```

### Step 5 — Explainability (`explainer.py`)
```python
- Method: Grad-CAM on last convolutional layer of classifier
- Library: TorchCAM (pip install torchcam)
- Output: heatmap resized to original image dimensions
- Apply: jet colormap, alpha-blend with original at 0.4 opacity
- Save: gradcam_overlay.png
```

### Step 6 — 3D Visualization (`visualizer.py`)
```python
For X-ray (pseudo-3D):
  - Estimate depth map from single image (use MiDaS or simple gradient)
  - Export as displacement map for Three.js PlaneGeometry

For CT:
  - Stack DICOM slices into 3D numpy volume
  - Marching cubes (skimage.measure) → mesh
  - Export as .glb (trimesh library)
  - Abnormal region: separate mesh colored with severity heatmap
```

---

## 🗄️ FILE/FOLDER STRUCTURE (Full Project)

```
explungu/
├── frontend/                    ← Next.js app
│   ├── app/
│   │   ├── page.tsx             ← Launch page (existing)
│   │   ├── explore/
│   │   │   └── page.tsx         ← Medical atlas (existing)
│   │   ├── analyze/
│   │   │   ├── page.tsx         ← Upload + trigger analysis
│   │   │   └── result/
│   │   │       └── [id]/
│   │   │           └── page.tsx ← Result dashboard
│   │   └── about/
│   │       └── page.tsx         ← Team + methodology
│   ├── components/
│   │   ├── launch/              ← Existing launch components
│   │   ├── explore/             ← Existing atlas components
│   │   ├── analyze/             ← NEW
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── AnalysisLoader.tsx
│   │   │   ├── ResultDashboard.tsx
│   │   │   ├── SeverityGauge.tsx
│   │   │   ├── 3DLungViewer.tsx
│   │   │   ├── ClinicalInsightCard.tsx
│   │   │   ├── GradCAMViewer.tsx
│   │   │   └── RegionBreakdown.tsx
│   │   └── shared/              ← NEW shared UI
│   │       ├── Navbar.tsx       ← Extend existing with /analyze link
│   │       ├── MedicalCard.tsx  ← Reusable glassmorphism card
│   │       └── LoadingPulse.tsx
│   ├── lib/
│   │   ├── api.ts               ← Axios instance + typed API calls
│   │   ├── store.ts             ← Zustand store
│   │   └── utils.ts             ← Shared helpers
│   ├── hooks/
│   │   ├── useAnalysisResult.ts ← SWR polling hook
│   │   └── useImageSequence.ts  ← Existing, keep
│   └── public/
│       └── scroll/              ← Existing 240 frames
│
├── backend/                     ← FastAPI
│   ├── main.py
│   ├── routers/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   ├── weights/                 ← .gitignore this
│   ├── temp/                    ← .gitignore this
│   ├── requirements.txt
│   └── .env.example
│
├── docker-compose.yml           ← Frontend + Backend + (Redis optional)
└── README.md
```

---

## 🔌 INTEGRATION CHECKLIST

When implementing, complete these in order:

### Sprint 1 — Core Backend
- [ ] FastAPI scaffold with health check
- [ ] `preprocessor.py` working for X-ray (JPEG/PNG)
- [ ] `segmentor.py` with dummy/mock U-Net (returns full mask initially)
- [ ] `classifier.py` with mock output
- [ ] `severity.py` computing score from mask
- [ ] API endpoints responding with correct schema
- [ ] CORS configured for `localhost:3000`

### Sprint 2 — Core Frontend (`/analyze`)
- [ ] `ImageUploader.tsx` with drag-drop + preview
- [ ] API call on upload, navigate to result page
- [ ] `AnalysisLoader.tsx` pipeline animation
- [ ] `ResultDashboard.tsx` layout (static/mocked data first)
- [ ] `SeverityGauge.tsx` animated gauge
- [ ] `GradCAMViewer.tsx` image display with tab switcher

### Sprint 3 — ML Integration
- [ ] Real U-Net segmentation model loaded
- [ ] Real EfficientNet classifier loaded
- [ ] Real Grad-CAM heatmap generated
- [ ] End-to-end flow: upload → real AI result → display

### Sprint 4 — Polish & 3D
- [ ] `3DLungViewer.tsx` pseudo-3D for X-ray
- [ ] True 3D for CT (if DICOM support added)
- [ ] PDF report generation
- [ ] `ClinicalInsightCard.tsx` with template-generated text
- [ ] `/about` page with team info and methodology diagram

### Sprint 5 — Scalability
- [ ] Zustand state management
- [ ] SWR polling for async results
- [ ] Dynamic imports for heavy components
- [ ] Docker Compose for both services
- [ ] Environment variable configuration

---

## 🚫 CONSTRAINTS & RULES

1. **Never break existing routes.** `/` and `/explore` must continue to work unchanged.
2. **No placeholder spinners.** Every loading state must be a purposeful, premium animation.
3. **TypeScript strict mode.** No `any` types. Define interfaces for every API response.
4. **Mobile-first.** Every new component must be fully responsive. Test at 375px.
5. **Accessibility.** All images have `alt` text. Color is never the only indicator of meaning. Keyboard-navigable.
6. **Medical disclaimer.** Every result page must show: *"This analysis is AI-assisted and does not constitute a clinical diagnosis. Always consult a qualified radiologist or physician."*
7. **Error states.** Every API call must have a graceful error UI — not just a console.error.
8. **Performance budget.** Lighthouse score > 85 on `/analyze`. Three.js and Plotly must be dynamically imported.

---

## 📋 SAMPLE MOCK DATA (for frontend-first development)

```typescript
// lib/mockData.ts
export const MOCK_RESULT = {
  scan_id: "mock-001",
  status: "complete",
  modality: "xray",
  condition: "Pneumonia",
  confidence: 0.91,
  severity_score: 58,
  severity_label: "Moderate",
  left_lung_involvement: 22.4,
  right_lung_involvement: 35.6,
  total_involvement: 29.0,
  grad_cam_url: "/mock/gradcam.png",
  segmented_url: "/mock/segmented.png",
  original_url: "/mock/original.png",
  mesh_url: null,
  clinical_insight: "Our model detected signs consistent with Pneumonia in the lower-right region of the lung. The affected area represents approximately 29% of total lung volume. Key visual indicators are highlighted in the Grad-CAM overlay, focusing on consolidation patterns in the right lower lobe.",
  processing_time_ms: 3840
}
```

---

## 🎬 UX FLOW (User Journey)

```
1. User lands on / (Launch Page)
   → Scroll animation plays
   → "Try the AI Tool" CTA button in hero section
   → Clicks → navigates to /analyze

2. /analyze page
   → Clean upload interface with drag-drop zone
   → User drops a chest X-ray
   → File preview appears, "Analyze Now" button lights up
   → Click → POST /api/analyze → navigate to /analyze/result/:id
   → AnalysisLoader plays pipeline animation (~5-15s)

3. /analyze/result/:id
   → ResultDashboard fades in
   → SeverityGauge animates to score
   → Image tabs: Original → Segmented → Grad-CAM (auto-cycles once)
   → User reads ClinicalInsightCard
   → Downloads PDF report
   → "Explore the Atlas" secondary CTA → /explore

4. /explore
   → Full medical education experience
   → Now includes DiseaseProgressionTimeline and ComparativeAnalysis
```

---

## 🔑 KEY PHRASES TO REMEMBER

When generating any component, keep these design principles in mind:

- **"Medical-grade, not clinical-cold"** — Precision and warmth can coexist
- **"Explain, don't just detect"** — Every number needs context
- **"The doctor is the user"** — Every UI decision must serve a clinician's workflow
- **"Performance is a feature"** — A slow diagnosis tool is a useless one
- **"Trust through transparency"** — Show confidence scores, show what the model looked at

---

*This prompt should be provided in full at the start of any new development session. Reference specific sections when working on individual components. The system is designed to be built incrementally — each sprint delivers a working, demonstrable slice of functionality.*