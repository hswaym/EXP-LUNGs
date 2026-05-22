import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.analyze import router as analyze_router
from routers.history import router as history_router
from routers.report import router as report_router
from routers.setup import router as setup_router

# Ensure static directory exists before mounting
os.makedirs("static/results", exist_ok=True)

app = FastAPI(title="ExpLung-U Inference API", version="1.0")

# CORS Configuration — credentials MUST be False when allow_origins=["*"]
# Using credentials=True with wildcard origin causes starlette to silently skip CORS headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and warm up Torch models globally on startup for zero-latency inference
@app.on_event("startup")
async def startup_event():
    import torch
    
    # 1. Warm up DenseNet-121 Classifier
    try:
        from services.classifier import load_densenet121, ml_models
        load_densenet121()
        if "classifier" in ml_models:
            print("[startup] Warming up DenseNet-121 classifier...")
            dummy_cls = torch.zeros(1, 3, 224, 224)
            with torch.no_grad():
                _ = ml_models["classifier"](dummy_cls)
            print("[startup] DenseNet-121 classifier warmed up successfully.")
    except Exception as e:
        print(f"[WARNING] Could not load/warmup DenseNet-121 on startup: {e}")
        
    # 2. Warm up U-Net Segmenter
    try:
        from services.severity import load_unet_segmenter, ml_segmenter
        load_unet_segmenter()
        if "unet" in ml_segmenter:
            print("[startup] Warming up U-Net segmenter...")
            dummy_seg = torch.zeros(1, 3, 256, 256)
            with torch.no_grad():
                _ = ml_segmenter["unet"](dummy_seg)
            print("[startup] U-Net segmenter warmed up successfully.")
    except Exception as e:
        print(f"[WARNING] Could not load/warmup U-Net segmenter on startup: {e}")


app.include_router(analyze_router)
app.include_router(history_router)
app.include_router(report_router)
app.include_router(setup_router)

# Serve generated CNN images as static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0",
        "gpu_available": False
    }

