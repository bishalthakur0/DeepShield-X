import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from forensics_engine import ForensicsEngine

app = FastAPI(title="DeepShield X AI Forensics Engine", version="1.0.0")

# Setup directories
TEMP_DIR = "temp_uploads"
STATIC_DIR = "static"
FORENSICS_DIR = os.path.join(STATIC_DIR, "forensics")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(FORENSICS_DIR, exist_ok=True)

# Allow CORS for Spring Boot backend and developers local calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve the generated heatmaps, FFT, and noise visual assets
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Instantiate forensics engine
engine = ForensicsEngine(output_dir=FORENSICS_DIR)

@app.get("/")
async def health_check():
    return {"status": "HEALTHY", "engine": "DeepShield X AI Forensics Core"}

@app.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    # Validate file type
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Supported: JPG, PNG, WEBP.")

    temp_path = os.path.join(TEMP_DIR, f"temp_{filename}")
    try:
        # Save file to temp path
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run analysis
        report = engine.analyze_image(temp_path)
        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")
    finally:
        # Clean up temporary uploaded file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...)):
    # Validate file type
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".mp4", ".avi", ".mov"]:
        raise HTTPException(status_code=400, detail="Invalid video format. Supported: MP4, AVI, MOV.")

    temp_path = os.path.join(TEMP_DIR, f"temp_{filename}")
    try:
        # Save file to temp path
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run analysis
        report = engine.analyze_video(temp_path)
        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")
    finally:
        # Clean up temporary uploaded file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
