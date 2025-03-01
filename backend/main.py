from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
from utils.image_processing import preprocess_image, extract_text_from_image
from utils.analysis import analyze_text
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI(
    title="Food Label Analyzer API",
    description="API for analyzing food labels using OCR and AI",
    version="1.0.0"
)

# Add after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-label")
async def analyze_label(file: UploadFile = File(...)):
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Process image
        processed_image = preprocess_image(image)
        
        # Extract text
        extracted_text = extract_text_from_image(processed_image)
        
        if not extracted_text:
            return {
                "success": False,
                "error": "Could not read the label. Please try a clearer image."
            }
        
        # Analyze text
        analysis = analyze_text(extracted_text)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "analysis": analysis
        }
        
    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 