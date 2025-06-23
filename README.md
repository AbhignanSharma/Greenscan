# GreenScan Mobile App

A cross-platform mobile application for plant disease analysis using deep learning and Firebase.

## Features
- Plant disease detection for banana, mango, and tomato
- Image upload and analysis
- Firebase integration for data storage
- Python backend with TensorFlow models
- Expo/React Native frontend

## Prerequisites
- Node.js (LTS recommended)
- npm
- Expo CLI (`npm install -g expo-cli`)
- Python 3.x (for backend)
- pip (Python package manager)
- Git (for version control)

## Getting Started

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd mobileapp
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
- Copy `.env.example` to `.env` and fill in your real values:

```sh
cp .env.example .env
```

- Edit `.env` and add your Firebase and backend config values.

### 4. Backend Setup
```sh
cd backend
python -m venv venv
# Activate the virtual environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 5. Running the App
```sh
# In the main project directory
npm start
# or
npx expo start
```
- Use Expo Go on your mobile device to scan the QR code.

## Environment Variables
All sensitive configuration is loaded from the `.env` file. See `.env.example` for required variables:
- Backend URLs
- Firebase config (apiKey, authDomain, etc.)

## Security Notes
- **Never commit your `.env` or `google-services.json` to GitHub.**
- All secrets and API keys are loaded from environment variables.
- If you accidentally commit secrets, rotate them immediately in your Firebase/other services.
- Restrict your Firebase rules to prevent abuse.
- Protect your backend endpoints if deploying publicly.

## License
[MIT](LICENSE)

---

**For any issues or contributions, please open an issue or pull request!** 