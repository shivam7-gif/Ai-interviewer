from fastapi import APIRouter, File, HTTPException, UploadFile
from app.ingest.resume import ResumeError, extract_resume_text

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("/resume")
async def ingest_resume(file: UploadFile = File(...)):
    data = await file.read()
    try:
        text = extract_resume_text(data)
    except ResumeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
    return {"text": text, "words": len(text.split())}
