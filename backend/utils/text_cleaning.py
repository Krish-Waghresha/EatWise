import logging

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