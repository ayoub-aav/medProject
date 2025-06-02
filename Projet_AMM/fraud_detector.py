# fraud_detector.py
import joblib
import pandas as pd
from PyPDF2 import PdfReader
import re
import sys
import os
from datetime import datetime, timedelta
import random
import warnings
from sklearn.exceptions import InconsistentVersionWarning
from flask_cors import CORS

# Flask imports
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# Suppress version mismatch warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

class PharmaFraudDetector:
    def __init__(self, model_path='amm.joblib'):
        """Initialize with trained model"""
        try:
            self.model = joblib.load(model_path)
            self.median_batch = 124600.0  # From your training data
            print("✅ Model loaded successfully")
        except Exception as e:
            raise ValueError(f"Model loading failed: {str(e)}")

    def validate_amm_format(self, text):
        """Validate AMM document format and required fields"""
        required_fields = {
            'Numéro AMM': r'Numéro AMM:\s*([A-Z0-9-]+)',
            'Médicament': r'Médicament:\s*([^\n]+)',
            'Substance Active': r'Substance Active:\s*([^\n]+)',
            'Forme Pharmaceutique': r'Forme Pharmaceutique:\s*([^\n]+)',
            'Date Fabrication': r'Date Fabrication:\s*(\d{4}-\d{2}-\d{2})',
            'Date Péremption': r'Date Péremption:\s*(\d{4}-\d{2}-\d{2})',
            'Fabricant': r'Fabricant:\s*([^\n]+)',
            'Numéro de Lot': r'Numéro de Lot:\s*([^\n]+)'
        }
        
        missing_fields = []
        extracted_data = {}
        
        for field, pattern in required_fields.items():
            match = re.search(pattern, text)
            if not match:
                missing_fields.append(field)
            else:
                extracted_data[field] = match.group(1).strip()
        
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
            
        return extracted_data

    def process_pdf(self, pdf_path):
        """Extract and validate data from AMM PDF"""
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found at {pdf_path}")
        
        try:
            with open(pdf_path, 'rb') as f:
                text = "\n".join([page.extract_text() for page in PdfReader(f).pages])
            
            # Validate AMM format and extract data
            extracted_data = self.validate_amm_format(text)
            
            # Additional validation rules
            fab_date = datetime.strptime(extracted_data['Date Fabrication'], '%Y-%m-%d')
            exp_date = datetime.strptime(extracted_data['Date Péremption'], '%Y-%m-%d')
            
            # Check expiration date is reasonable (1-5 years from fabrication)
            if (exp_date - fab_date).days < 365 or (exp_date - fab_date).days > 1825:
                raise ValueError("Invalid expiration date range")
            
            # Generate synthetic data for missing fields
            manufacturer = extracted_data['Fabricant']
            submission_date = (fab_date - timedelta(days=random.randint(60, 180))).strftime('%Y-%m-%d')
            approval_date = (fab_date - timedelta(days=random.randint(30, 60))).strftime('%Y-%m-%d')
            
            # Generate clinical data based on product type
            participants = random.randint(800, 2000)
            side_effects = random.randint(5, int(participants * 0.1))
            
            # Generate production data
            batch_size = random.choice([50000, 100000, 150000, 200000])
            production_cost = round(random.uniform(5.0, 15.0), 2)
            price = round(production_cost * random.uniform(3.0, 8.0), 2)
            
            return {
                'amm_number': extracted_data['Numéro AMM'],
                'product_name': extracted_data['Médicament'],
                'manufacturer': manufacturer,
                'submission_date': submission_date,
                'approval_date': approval_date,
                'clinical_trial_participants': participants,
                'reported_side_effects': side_effects,
                'batch_size': batch_size,
                'price_per_unit': price,
                'production_cost': production_cost
            }
        except Exception as e:
            raise ValueError(f"PDF processing error: {str(e)}")
    
    def predict(self, data):
        """Run fraud prediction with feature engineering"""
        try:
            df = pd.DataFrame([data])
            
            # Feature engineering (must match training)
            df['submission_date'] = pd.to_datetime(df['submission_date'])
            df['approval_date'] = pd.to_datetime(df['approval_date'])
            df['approval_time'] = (df['approval_date'] - df['submission_date']).dt.days
            df['price_to_cost_ratio'] = df['price_per_unit'] / df['production_cost']
            df['batch_size_variation'] = df['batch_size'] / self.median_batch
            df['fast_approval'] = (df['approval_time'] < 30).astype(int)
            
            # One-hot encode manufacturers
            manufacturers = [
                'BioPharm Solutions',
                'CureAll', 
                'HealthGen',
                'MediVita',
                'PharmaCorp'
            ]
            for mfg in manufacturers:
                df[f'manufacturer_{mfg}'] = (df['manufacturer'] == mfg).astype(int)
            
            # Required features
            features = [
                'approval_time',
                'price_to_cost_ratio',
                'batch_size_variation',
                'fast_approval',
                'clinical_trial_participants',
                'reported_side_effects'
            ] + [f'manufacturer_{mfg}' for mfg in manufacturers]
            
            # Make prediction
            proba = self.model.predict_proba(df[features])[0][1]
            is_fraud = self.model.predict(df[features])[0]
            
            return {
                'status': "FRAUD" if is_fraud else "VALID",
                'probability': float(proba),
                'engineered_features': {
                    'approval_days': int(df['approval_time'].iloc[0]),
                    'price_ratio': round(df['price_to_cost_ratio'].iloc[0], 1),
                    'batch_variation': round(df['batch_size_variation'].iloc[0], 2),
                    'is_fast_track': bool(df['fast_approval'].iloc[0])
                }
            }
        except Exception as e:
            raise ValueError(f"Prediction error: {str(e)}")
        
def main(pdf_path):
    """Run the full detection pipeline"""
    print(f"\n⚕️ Pharmaceutical Fraud Detection System")
    print(f"Processing: {os.path.basename(pdf_path)}")
    
    try:
        detector = PharmaFraudDetector()
        
        # Step 1: Extract data
        print("\n🔍 Extracting PDF data...")
        data = detector.process_pdf(pdf_path)
        
        print("\n📋 Extracted Data:")
        for k, v in data.items():
            print(f"{k:>28}: {v}")
        
        # Step 2: Predict
        print("\n🔄 Analyzing for fraud...")
        result = detector.predict(data)
        
        # Step 3: Display results
        print("\n🔎 Fraud Analysis Results:")
        print(f" STATUS: {'❌ FRAUD' if result['status'] == 'FRAUD' else '✅ VALID'}")
        print(f" CONFIDENCE: {result['probability']:.1%}")
        
        print("\n🚩 Key Indicators:")
        for k, v in result['engineered_features'].items():
            print(f" {k.replace('_', ' '):>18}: {v}")
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

def create_flask_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)  # This will enable CORS for all routes
    # Configuration
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf'}
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    
    # Initialize the fraud detector
    detector = PharmaFraudDetector()

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @app.route('/health')
    def health_check():
        try:
            # Verify model is loaded by making a dummy prediction
            dummy_data = {
                'amm_number': 'TEST123',
                'manufacturer': 'Test',
                'submission_date': '2023-01-01',
                'approval_date': '2023-02-01',
                'clinical_trial_participants': 1000,
                'reported_side_effects': 50,
                'batch_size': 100000,
                'price_per_unit': 10.0,
                'production_cost': 5.0
            }
            result = detector.predict(dummy_data)
            return jsonify({
                "status": "healthy",
                "model_loaded": True,
                "api_version": "1.0"
            }), 200
        except Exception as e:
            return jsonify({
                "status": "unhealthy",
                "error": str(e)
            }), 500

    @app.route('/validate_amm', methods=['POST'])
    def validate_amm():
        """Endpoint for validating AMM PDFs"""
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                # Process and validate the PDF
                extracted_data = detector.process_pdf(filepath)
                validation_result = detector.predict(extracted_data)
                
                # Clean up the uploaded file
                os.remove(filepath)
                
                return jsonify({
                    'status': validation_result['status'],
                    'probability': validation_result['probability'],
                    'extracted_data': extracted_data,
                    'engineered_features': validation_result['engineered_features']
                })
                
            except Exception as e:
                # Clean up the uploaded file if something went wrong
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({'error': str(e)}), 500
        
        return jsonify({'error': 'Invalid file type'}), 400

    return app

if __name__ == "__main__":
    # When run directly, support both CLI and Flask modes
    if len(sys.argv) == 2 and sys.argv[1] == '--flask':
        app = create_flask_app()
        # Create upload folder if it doesn't exist
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        print("\n🔌 Starting Flask server...")
        print("   POST PDFs to /validate_amm to validate AMM documents")
        app.run(debug=True, host='0.0.0.0', port=5000)
    elif len(sys.argv) == 2:
        # Original CLI functionality
        main(sys.argv[1])
    else:
        print("Usage:")
        print("  For PDF validation: python fraud_detector.py <PDF_PATH>")
        print("  For Flask API: python fraud_detector.py --flask")
        sys.exit(1)