import csv
from datetime import datetime, timedelta
import random

# Generate realistic pharmaceutical data
def generate_amm_data(num_records):
    data = []
    manufacturers = ["PharmaCorp", "HealthGen", "MediVita", "CureAll", "BioPharm Solutions"]
    products = {
        "MediSafeX": {"type": "antibiotic", "normal_dosage": "500mg", "suspicious_dosage": "2000mg"},
        "QuickHeal": {"type": "painkiller", "normal_dosage": "400mg", "suspicious_dosage": "800mg"},
        "PainAway": {"type": "analgesic", "normal_dosage": "200mg", "suspicious_dosage": "1000mg"},
        "FlexiJoint": {"type": "anti-inflammatory", "normal_dosage": "100mg", "suspicious_dosage": "500mg"},
        "CardioPlus": {"type": "cardiovascular", "normal_dosage": "50mg", "suspicious_dosage": "200mg"}
    }
    
    for i in range(1, num_records + 1):
        amm_number = f"AMM-2023-{i:03d}"
        product_name = random.choice(list(products.keys()))
        manufacturer = random.choice(manufacturers)
        
        # Generate realistic dates
        submission_date = datetime(2023, 1, 1) + timedelta(days=random.randint(0, 180))
        
        # Determine if this will be a fraudulent record
        is_fraud = random.random() < 0.2  # 20% chance of fraud
        
        if is_fraud:
            # Fraudulent characteristics
            approval_days = random.randint(1, 14)  # Suspiciously fast approval
            participants = random.randint(150, 500)  # Small trial
            side_effects = int(participants * random.uniform(0.15, 0.3))  # High side effects
            batch_size = random.choice([10000, 20000, 30000])  # Small batches
            production_cost = round(random.uniform(2.0, 5.0), 2)  # Suspiciously low cost
            price = round(production_cost * random.uniform(15.0, 30.0), 2)  # High markup
        else:
            # Normal characteristics
            approval_days = random.randint(60, 180)  # Normal approval time
            participants = random.randint(800, 2000)  # Large trial
            side_effects = random.randint(5, int(participants * 0.1))  # Normal side effects
            batch_size = random.choice([100000, 150000, 200000])  # Normal batch size
            production_cost = round(random.uniform(5.0, 15.0), 2)  # Normal cost
            price = round(production_cost * random.uniform(3.0, 8.0), 2)  # Normal markup
        
        approval_date = submission_date + timedelta(days=approval_days)
        
        # Additional fraud indicators
        suspicious_patterns = []
        if is_fraud:
            if approval_days < 30:
                suspicious_patterns.append("fast_approval")
            if price/production_cost > 10:
                suspicious_patterns.append("high_markup")
            if side_effects/participants > 0.15:
                suspicious_patterns.append("high_side_effects")
            if batch_size < 50000:
                suspicious_patterns.append("small_batch")
            if participants < 500:
                suspicious_patterns.append("small_trial")
        
        data.append([
            amm_number,
            product_name,
            manufacturer,
            submission_date.strftime("%Y-%m-%d"),
            approval_date.strftime("%Y-%m-%d"),
            participants,
            side_effects,
            batch_size,
            f"{price:.2f}",
            f"{production_cost:.2f}",
            is_fraud,
            ",".join(suspicious_patterns) if suspicious_patterns else "none"
        ])
    
    return data

# Write to CSV
def write_to_csv(filename, data):
    headers = [
        "amm_number", "product_name", "manufacturer", "submission_date", "approval_date",
        "clinical_trial_participants", "reported_side_effects", "batch_size",
        "price_per_unit", "production_cost", "is_fraud", "suspicious_patterns"
    ]
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        writer.writerows(data)
    print(f"Generated {filename} with {len(data)} records")
    print(f"Fraud rate: {sum(1 for row in data if row[10] == 1)/len(data):.1%}")

# Generate and save data
pharma_data = generate_amm_data(1000)  # Generate 1000 records
write_to_csv("pharma_amm_data.csv", pharma_data)