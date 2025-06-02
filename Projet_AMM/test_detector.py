from fraud_detector import PharmaFraudDetector

# Initialize detector (uses default paths)
detector = PharmaFraudDetector()

# Example input matching your original data format
sample_record = {
    'amm_number': 'AMM-2023-999',
    'product_name': 'FlexiJoint',
    'manufacturer': 'PharmaCorp',
    'submission_date': '2023-05-01',
    'approval_date': '2023-07-15',
    'clinical_trial_participants': 800,
    'reported_side_effects': 30,
    'batch_size': 150000,
    'price_per_unit': 150.50,
    'production_cost': 12.75
}

# Make prediction
result = detector.predict(sample_record)
print("\nPrediction Results:")
print(f"Is Fraud: {result['is_fraud']}")
print(f"Probability: {result['probability']:.2%}")
print("\nEngineered Features:")
for k, v in result['engineered_features'].items():
    print(f"{k}: {v}")

# Test error handling
print("\nTesting error handling:")
bad_record = {'manufacturer': 'Unknown'}
print(detector.predict(bad_record))