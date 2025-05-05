import csv
from datetime import datetime, timedelta
import random

# Generate realistic pharmaceutical data
def generate_amm_data(num_records):
    data = []
    manufacturers = ["PharmaCorp", "HealthGen", "MediVita", "CureAll", "BioPharm Solutions"]
    products = ["MediSafeX", "QuickHeal", "PainAway", "FlexiJoint", "CardioPlus"]
    
    for i in range(1, num_records + 1):
        amm_number = f"AMM-2023-{i:03d}"
        product_name = random.choice(products)
        manufacturer = random.choice(manufacturers)
        
        # Generate realistic dates
        submission_date = datetime(2023, 1, 1) + timedelta(days=random.randint(0, 180))
        approval_days = random.randint(15, 180)  # Normal range
        if random.random() < 0.1:  # 10% chance of suspiciously fast approval
            approval_days = random.randint(1, 14)
        approval_date = submission_date + timedelta(days=approval_days)
        
        # Generate clinical data
        participants = random.randint(200, 2000)
        side_effects = random.randint(5, int(participants * 0.1))
        
        # Generate production data
        batch_size = random.choice([50000, 100000, 150000, 200000])
        production_cost = round(random.uniform(5.0, 15.0), 2)
        
        # Price calculation with occasional anomalies
        if random.random() < 0.9:  # 90% normal pricing
            price = round(production_cost * random.uniform(3.0, 8.0), 2)
        else:  # 10% price anomalies
            price = round(production_cost * random.uniform(10.0, 30.0), 2)
        
        # Determine fraud (simple heuristic)
        is_fraud = 0
        if (approval_days < 30 or 
            price/production_cost > 10 or 
            side_effects/participants > 0.15):
            is_fraud = 1
            
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
            is_fraud
        ])
    
    return data

# Write to CSV
def write_to_csv(filename, data):
    headers = [
        "amm_number", "product_name", "manufacturer", "submission_date", "approval_date",
        "clinical_trial_participants", "reported_side_effects", "batch_size",
        "price_per_unit", "production_cost", "is_fraud"
    ]
    
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        writer.writerows(data)
    print(f"Generated {filename} with {len(data)} records")

# Generate and save data
pharma_data = generate_amm_data(1000)  # Generate 1000 records
write_to_csv("pharma_amm_data.csv", pharma_data)