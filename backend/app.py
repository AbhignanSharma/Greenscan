from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
from io import BytesIO
import cv2
import os
from config import SERVER_CONFIG, CORS_CONFIG, MODEL_CONFIG

app = Flask(__name__)
# Configure CORS
CORS(app, resources={r"/*": {
    "origins": CORS_CONFIG['origins'],
    "methods": CORS_CONFIG['methods'],
    "allow_headers": CORS_CONFIG['allow_headers']
}})

# Load models
models = {}
for plant_type, config in MODEL_CONFIG.items():
    try:
        if not os.path.exists(config["path"]):
            raise FileNotFoundError(f"Model file not found: {config['path']}")
        models[plant_type] = tf.keras.models.load_model(config["path"])
        print(f"Successfully loaded {plant_type} model")
    except Exception as e:
        print(f"Error loading {plant_type} model: {str(e)}")
        raise

def preprocess_image(base64_data, input_size=(128, 128)):
    try:
        # Remove the data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode base64 image
        image_data = base64.b64decode(base64_data)
        img = Image.open(BytesIO(image_data))
        
        # Convert to RGB if needed
        img = img.convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Check if image is valid
        if img_array.size == 0:
            raise ValueError("Empty image received")
            
        # Resize image to match model input size
        img_resized = cv2.resize(img_array, input_size)
        
        # Normalize pixel values (matching Raspberry Pi implementation)
        img_normalized = img_resized / 255.0
        
        # Add batch dimension
        img_batch = np.expand_dims(img_normalized, axis=0)
        
        return img_batch
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data received'}), 400
            
        image_data = data.get('imageData')
        plant_type = data.get('plantType')
        
        if not image_data:
            return jsonify({'error': 'Missing imageData'}), 400
        if not plant_type:
            return jsonify({'error': 'Missing plantType'}), 400
            
        if plant_type not in models:
            return jsonify({'error': f'Invalid plant type. Must be one of: {", ".join(models.keys())}'}), 400
            
        # Get model configuration
        config = MODEL_CONFIG[plant_type]
        
        # Preprocess image
        try:
            processed_image = preprocess_image(image_data, config["input_size"])
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Get prediction
        try:
            model = models[plant_type]
            prediction = model.predict(processed_image, verbose=0)
            
            # Print prediction shape for debugging
            print(f"Prediction shape: {prediction.shape}")
            print(f"Prediction values: {prediction[0]}")
            
            # Get class and confidence
            class_idx = np.argmax(prediction[0])
            confidence = float(prediction[0][class_idx])
            result = config["classes"][class_idx]
            
            # Handle each plant type separately
            if plant_type == "banana":
                if "healthy" in result.lower():
                    analysis = "Plant is healthy"
                elif "sigatoka" in result.lower():
                    analysis = "Plant has Black Sigatoka disease"
                elif "fusarium" in result.lower():
                    analysis = "Plant has Fusarium Wilt disease"
                else:
                    analysis = f"Plant has {result} deficiency"
            elif plant_type == "mango":
                if result == "Healthy":
                    analysis = "Mango plant is healthy"
                else:
                    analysis = f"Mango plant has {result}"
            elif plant_type == "tomato":
                if result == "Tomato___healthy":
                    analysis = "Tomato plant is healthy"
                else:
                    # Remove the "Tomato___" prefix and format the disease name
                    disease = result.replace("Tomato___", "").replace("_", " ")
                    analysis = f"Tomato plant has {disease}"
            
            return jsonify({
                'analysis': analysis,
                'class': result
            })
        except Exception as e:
            return jsonify({'error': f'Error during prediction: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting server...")
    print("Available models:", list(models.keys()))
    print(f"Server running on {SERVER_CONFIG['host']}:{SERVER_CONFIG['port']}")
    app.run(
        host=SERVER_CONFIG['host'],
        port=SERVER_CONFIG['port'],
        debug=SERVER_CONFIG['debug']
    )