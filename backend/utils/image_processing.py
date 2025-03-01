from PIL import Image, ImageEnhance
import numpy as np
from paddleocr import PaddleOCR
import logging
from .text_cleaning import clean_nutrition_text

def preprocess_image(image):
    """Preprocess image for better OCR accuracy"""
    try:
        # Convert to grayscale
        gray = image.convert('L')
        
        # Enhance contrast more aggressively
        enhancer = ImageEnhance.Contrast(gray)
        enhanced = enhancer.enhance(2.5)  # Increased from 2.0
        
        # Enhance sharpness
        sharp_enhancer = ImageEnhance.Sharpness(enhanced)
        sharpened = sharp_enhancer.enhance(2.0)
        
        # Resize if image is too small (increased minimum size)
        if sharpened.size[0] < 1500:  # Increased from 1000
            ratio = 1500 / sharpened.size[0]
            sharpened = sharpened.resize((int(sharpened.size[0] * ratio), int(sharpened.size[1] * ratio)))
        
        return sharpened
    except Exception as e:
        logging.error(f"Preprocessing Error: {str(e)}")
        return image

def extract_text_from_image(image):
    """Extract text from image using PaddleOCR with improved table structure"""
    try:
        # Initialize PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en', table=True)
        
        # Convert PIL Image to numpy array
        img_array = np.array(image)
        
        # Get OCR result with table structure
        result = ocr.ocr(img_array, cls=True)
        
        # Store text with their coordinates
        text_blocks = []
        if result[0]:  # Check if results exist
            for line in result[0]:
                coordinates = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                text = line[1][0]  # text content
                confidence = line[1][1]  # confidence score
                
                if confidence > 0.5:  # Filter low confidence predictions
                    # Get the middle y-coordinate for sorting
                    y_middle = (coordinates[0][1] + coordinates[2][1]) / 2
                    # Get the x-coordinate for horizontal positioning
                    x_start = coordinates[0][0]
                    
                    text_blocks.append({
                        'text': text,
                        'y': y_middle,
                        'x': x_start
                    })
        
        # Sort blocks by vertical position first
        text_blocks.sort(key=lambda x: x['y'])
        
        # Group text blocks into rows based on y-coordinate proximity
        rows = []
        current_row = []
        last_y = None
        y_threshold = 10  # Adjust this value based on your needs
        
        for block in text_blocks:
            if last_y is None or abs(block['y'] - last_y) <= y_threshold:
                current_row.append(block)
            else:
                if current_row:
                    # Sort each row by x-coordinate
                    current_row.sort(key=lambda x: x['x'])
                    rows.append(current_row)
                current_row = [block]
            last_y = block['y']
        
        if current_row:
            current_row.sort(key=lambda x: x['x'])
            rows.append(current_row)
        
        # Format rows into structured text
        formatted_lines = []
        for row in rows:
            # Check if this row might be a value-unit pair
            if len(row) == 2:
                text1, text2 = row[0]['text'], row[1]['text']
                # If the second part looks like a unit (g, mg, %, etc.)
                if any(text2.lower().endswith(unit) for unit in ['g', 'mg', '%']):
                    formatted_lines.append(f"{text1}: {text2}")
                else:
                    formatted_lines.append(' '.join(block['text'] for block in row))
            else:
                formatted_lines.append(' '.join(block['text'] for block in row))
        
        # Join lines with proper spacing
        formatted_text = '\n'.join(formatted_lines)
        
        # Clean and validate the extracted text
        cleaned_text = clean_nutrition_text(formatted_text)
        
        logging.debug(f"Extracted text: {cleaned_text}")
        return cleaned_text
    except Exception as e:
        logging.error(f"OCR Error: {str(e)}")
        return None 