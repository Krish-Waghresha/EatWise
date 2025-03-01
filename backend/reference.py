import streamlit as st
from PIL import Image
import requests
import time
import logging
from PIL import ImageEnhance
import numpy as np
from paddleocr import PaddleOCR
# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Set page configuration
st.set_page_config(
    page_title="Food Label Analyzer",
    page_icon="🍽️",
    layout="wide"
)

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

def clean_nutrition_text(text):
    """Clean and validate nutrition label text"""
    if not text:
        return text
    
    # Remove unnecessary whitespace while preserving table structure
    lines = [' '.join(line.split()) for line in text.split('\n')]
    text = '\n'.join(lines)
    
    # Enhanced OCR corrections for nutrition labels
    replacements = {
        '|': '1',
        'O': '0',
        'g.': 'g',
        'rng': 'mg',
        'mq': 'mg',
        'q': 'g',
        '%o': '%',
        'qg': 'g',
        'mgl': 'mg',
        'Protein': 'Protein',
        'Proteln': 'Protein',
        'Serving Size': 'Serving Size',
        'Servina Size': 'Serving Size',
        'Calories': 'Calories',
        'Calorles': 'Calories',
        'Total Fat': 'Total Fat',
        'Cholesterol': 'Cholesterol',
        'Sodium': 'Sodium',
        'Sodlum': 'Sodium',
        'Carbohydrate': 'Carbohydrate',
        'Carbohvdrate': 'Carbohydrate',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Ensure common nutrition terms are present
    nutrition_keywords = [
        'serving size', 'calories', 'total fat', 'cholesterol', 
        'sodium', 'carbohydrate', 'protein', 'sugar', 'fiber'
    ]
    found_keywords = sum(1 for keyword in nutrition_keywords if keyword.lower() in text.lower())
    
    # If less than 4 keywords found, text might not be a nutrition label
    if found_keywords < 4:
        logging.warning("Extracted text might not be a nutrition label")
    
    return text

def analyze_text(text):
    """Analyze extracted text using BART for classification and Mixtral for detailed analysis"""
    API_TOKEN = st.secrets["hf_token"]
    
    # Use BART for initial classification
    classification_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
    # Use Mixtral for detailed analysis
    analysis_url = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Get initial classification based on nutritional values
    classification_payload = {
        "inputs": text,
        "parameters": {
            "candidate_labels": ["healthy", "unhealthy"]
        }
    }
    
    logging.debug(f"Sending text to BART model for classification")
    
    for attempt in range(3):
        try:
            logging.info(f"Attempt {attempt + 1} to get analysis")
            response = requests.post(classification_url, headers=headers, json=classification_payload)
            logging.debug(f"Classification response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                
                if 'scores' in result and 'labels' in result:
                    verdict = result['labels'][0]
                    confidence = result['scores'][0]
                    
                    # First analysis using Mixtral with focus on nutritional values
                    analysis_prompt = f"""<s>[INST] You are a skilled nutritionist with expertise in dietary planning and nutrition science. 

Given this nutrition facts table:

{text}

Provide a professional analysis in exactly 3 bullet points explaining why this food is considered {verdict}. Focus on:
- Caloric content and serving size
- Macronutrients (fats, proteins, carbohydrates)
- Key nutrients, vitamins, and minerals
- Daily value percentages

Base your analysis on standard nutritional guidelines and recommended daily values.

Format your response as bullet points only, without any introduction or conclusion. [/INST]"""
                    
                    analysis_payload = {
                        "inputs": analysis_prompt,
                        "parameters": {
                            "max_new_tokens": 200,
                            "temperature": 0.3,
                            "top_p": 0.9,
                            "return_full_text": False
                        }
                    }
                    
                    explanation_response = requests.post(analysis_url, headers=headers, json=analysis_payload)
                    logging.debug(f"Explanation response: {explanation_response.text}")
                    
                    if explanation_response.status_code == 200:
                        analysis_result = explanation_response.json()
                        if isinstance(analysis_result, list) and len(analysis_result) > 0:
                            generated_text = analysis_result[0]["generated_text"]
                            
                            # Process the response into bullet points
                            points = [line.strip() for line in generated_text.split('\n') 
                                    if line.strip() and not line.startswith('[')]
                            
                            # Clean up the points and ensure proper bullet points
                            formatted_points = []
                            for point in points:
                                # Remove any leading dashes or bullets
                                point = point.lstrip('- •').strip()
                                if point and len(point) > 10:  # Ensure meaningful content
                                    formatted_points.append(f"• {point}")
                            
                            # Take first 3 points or pad with defaults if needed
                            while len(formatted_points) < 3:
                                if verdict == "healthy":
                                    formatted_points.append("• Contains balanced nutritional profile with good macro distribution")
                                else:
                                    formatted_points.append("• Exceeds recommended values for certain nutrients")
                            
                            explanation = '\n'.join(formatted_points[:3])
                            
                            # Second pass through Mixtral for conclusion and recommendation
                            conclusion_prompt = f"""<s>[INST] As a nutritionist, based on this nutritional analysis:

{explanation}

Provide two things:
1. A one-line conclusion about potential health effects based on these nutritional values
2. A specific recommendation for serving frequency (daily, weekly, monthly) considering the nutritional content

Format as two short bullet points. [/INST]"""
                            
                            try:
                                conclusion_payload = {
                                    "inputs": conclusion_prompt,
                                    "parameters": {
                                        "max_new_tokens": 100,
                                        "temperature": 0.3,
                                        "top_p": 0.9,
                                        "return_full_text": False
                                    }
                                }
                                
                                conclusion_response = requests.post(analysis_url, headers=headers, json=conclusion_payload)
                                logging.debug(f"Conclusion response: {conclusion_response.text}")
                                
                                # Default values
                                health_impact = "Impact depends on overall diet and individual nutritional needs"
                                consumption_freq = "Moderate consumption recommended" if verdict == "unhealthy" else "Can be included in regular diet"
                                
                                if conclusion_response.status_code == 200:
                                    conclusion_result = conclusion_response.json()
                                    if (isinstance(conclusion_result, list) and 
                                        len(conclusion_result) > 0 and 
                                        conclusion_result[0].get("generated_text")):
                                        
                                        conclusion_text = conclusion_result[0]["generated_text"]
                                        # Split on newlines and clean up
                                        conclusion_points = [p.strip().lstrip('- •') for p in conclusion_text.split('\n') 
                                                           if p.strip() and not p.startswith('[')]
                                        
                                        # Get health impact and consumption frequency
                                        if conclusion_points:
                                            health_impact = conclusion_points[0]
                                            if len(conclusion_points) > 1:
                                                consumption_freq = conclusion_points[1]

                                            # Final classification pass using the health impact and consumption frequency
                                            final_classification_payload = {
                                                "inputs": f"{health_impact}\n{consumption_freq}",
                                                "parameters": {
                                                    "candidate_labels": ["healthy", "unhealthy"]
                                                }
                                            }
                                            
                                            final_response = requests.post(classification_url, headers=headers, json=final_classification_payload)
                                            if final_response.status_code == 200:
                                                final_result = final_response.json()
                                                if 'scores' in final_result and 'labels' in final_result:
                                                    verdict = final_result['labels'][0]
                                                    confidence = final_result['scores'][0]
                            
                            except Exception as e:
                                logging.error(f"Error in conclusion generation: {str(e)}")
                                # Keep the default values
                            
                            formatted_response = f"""Verdict: {verdict.title()}
Confidence: {confidence:.0%}
Explanation:
{explanation}
Health Impact:
{health_impact}
Recommended Consumption:
{consumption_freq}"""
                    
                            return formatted_response
            
            elif response.status_code == 503:
                st.warning("Model is loading... Please wait.")
                time.sleep(3)
            else:
                st.warning(f"Attempt {attempt + 1} failed. Retrying...")
                time.sleep(2)
        except Exception as e:
            logging.error(f"Error during analysis: {str(e)}")
            if attempt == 2:
                return """Verdict: Unable to analyze
Confidence: N/A
Explanation:
• Could not process the ingredients
• Please try with a clearer image
• Ensure text is readable
Health Impact: Unable to determine
Recommended Consumption: Consult with healthcare provider"""
            time.sleep(2)
    
    return """Verdict: Analysis failed
Confidence: N/A
Explanation:
• Analysis unavailable
• Please try again with clearer text
• Make sure ingredients are visible
Health Impact: Unable to determine
Recommended Consumption: Consult with healthcare provider"""

def main():
    st.title("Food Label Analyzer 🍽️")
    st.write("Upload a photo of a food label to get an expert nutritionist's verdict")
    
    # Add instructions
    st.info("""
    📸 Tips for best results:
    1. Ensure the nutrition label is clearly visible
    2. Good lighting is important
    3. Avoid glare or shadows
    4. Try to capture the entire label
    """)
    
    # File uploader
    uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
    
    if uploaded_file is not None:
        try:
            # Display the uploaded image
            image = Image.open(uploaded_file)
            col1, col2 = st.columns(2)
            
            with col1:
                st.image(image, caption="Uploaded Image", use_column_width=True)
                
                # Add display of preprocessed image in expander
                with st.expander("Show Preprocessed Image"):
                    processed_image = preprocess_image(image)
                    st.image(processed_image, caption="Preprocessed Image", use_column_width=True)
            
            # Extract and analyze text
            with st.spinner("Getting nutritionist's verdict..."):
                # Extract text using OCR
                logging.info("Starting OCR text extraction")
                extracted_text = extract_text_from_image(image)
                
                if extracted_text:
                    logging.info("Starting text analysis")
                    # Analyze the extracted text
                    analysis = analyze_text(extracted_text)
                    
                    with col2:
                        st.subheader("Nutritionist's Verdict")
                        
                        # Show extracted text in expandable section
                        with st.expander("Show Extracted Text"):
                            st.text(extracted_text)
                        
                        sections = analysis.split('\n')  # Split into 4 parts now
                        # # Parse and display the analysis
                        # if len(sections) >= 4:
                        #     verdict = sections[0].replace('Verdict:', '').strip()
                        #     confidence = sections[1].replace('Confidence:', '').strip()
                        #     explanation = sections[2].replace('Explanation:', '').strip()
                        #     health_impact = sections[3].replace('Health Impact:', '').strip()
                        #     consumption_freq = sections[4].replace('Recommended Consumption:', '').strip()
                            
                        #     # Style based on verdict
                        #     if 'healthy' in verdict.lower():
                        #         st.success(f"🟢 Verdict: {verdict}")
                        #     else:
                        #         st.error(f"🔴 Verdict: {verdict}")
                            
                        #     st.write(f"💪 Confidence: {confidence}")
                        #     st.info("💡 Explanation:")
                        #     st.markdown(explanation)
                        #     st.info("💡 Health Impact:")
                        #     st.markdown(health_impact)
                        #     st.warning("📋 Recommended Consumption:")
                        #     st.markdown(consumption_freq)
                        # st.write(analysis)
                        st.write(sections)
                else:
                    logging.error("Text extraction failed")
                    st.error("Could not read the label. Please try a clearer image.")
                    
        except Exception as e:
            logging.error(f"Main process error: {str(e)}")
            st.error(f"Error during processing: {str(e)}")
            st.info("""
                If you're seeing an error, please try:
                1. Using a clearer image
                2. Making sure the text is well-lit
                3. Cropping to show just the nutrition label
                4. Using a higher resolution image
                """)

if __name__ == "__main__":
    main() 