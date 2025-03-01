import requests
import logging
import os
import time
from dotenv import load_dotenv

load_dotenv()

def analyze_text(text):
    """Analyze extracted text using BART for classification and Mixtral for detailed analysis"""
    API_TOKEN = os.getenv("HF_TOKEN")
    
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
                logging.warning("Model is loading... Please wait.")
                time.sleep(3)
            else:
                logging.warning(f"Attempt {attempt + 1} failed. Retrying...")
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