# Backend Configuration

# Server Configuration
SERVER_CONFIG = {
    'host': '192.168.241.189',  # Original IP address
    'port': 5000,               # Port number
    'debug': True               # Debug mode
}

# CORS Configuration
CORS_CONFIG = {
    'origins': '*',     # Allow all origins
    'methods': ['GET', 'POST', 'OPTIONS'],  # Allowed methods
    'allow_headers': ['Content-Type', 'Authorization']  # Allowed headers
}

# Model Configuration
MODEL_CONFIG = {
    "banana": {
        "path": "banana_model.h5",
        "input_size": (128, 128),
        "classes": [
            'black_sigatoka', 'black_sigatoka', 'boron', 'calcium', 
            'fusarium_wilt', 'fusarium_wilt', 'healthy', 'healthy', 
            'healthy', 'iron', 'magnesium', 'manganese', 'potassium', 
            'sulphur', 'zinc'
        ]
    },
    "mango": {
        "path": "mango_model.h5",
        "input_size": (128, 128),
        "classes": [
            "Anthracnose",
            "Bacterial Canker",
            "Cutting Weevil",
            "Die Back",
            "Gall Midge",
            "Healthy",
            "Powdery Mildew",
            "Sooty Mould"
        ]
    },
    "tomato": {
        "path": "tomato_model.h5",
        "input_size": (128, 128),
        "classes": [
            "Tomato___Bacterial_spot",
            "Tomato___Early_blight",
            "Tomato___Late_blight",
            "Tomato___Leaf_Mold",
            "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
            "Tomato___Tomato_mosaic_virus",
            "Tomato___healthy"
        ]
    }
} 