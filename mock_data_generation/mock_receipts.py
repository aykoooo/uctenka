import json
import csv
import random
from datetime import datetime, timedelta
import uuid

# Configuration
START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 3, 4)
IMAGE_URL = "https://i.imgur.com/21IPoqF.png"
START_ID = 100

# Handyman/Plumber Data
EXPENSE_VENDORS = [
    {"name": "OBI", "ico": "46612473", "category": "hardware", "sub": "tools"},
    {"name": "Hornbach", "ico": "47116622", "category": "hardware", "sub": "tools"},
    {"name": "Ptáček - velkoobchod", "ico": "25501143", "category": "shopping", "sub": "plumbing"},
    {"name": "Stavebniny DEK", "ico": "27636801", "category": "shopping", "sub": "materials"},
    {"name": "Benzina", "ico": "60193328", "category": "transportation", "sub": "fuel"},
    {"name": "Shell", "ico": "15890554", "category": "transportation", "sub": "fuel"}
]

INCOME_VENDORS = [
    {"name": "Faktura: SVJ Novákova", "ico": "12345678", "category": "income", "sub": "services"},
    {"name": "Faktura: Rekonstrukce Koupelny", "ico": "87654321", "category": "income", "sub": "services"},
    {"name": "Faktura: Oprava potrubí", "ico": "11223344", "category": "income", "sub": "services"}
]

def get_conf():
    """Returns a 50/50 mix of High or Certain for the confidence score"""
    return random.choice(["High", "Certain"])

def wrap(val):
    """Helper to wrap values in Mindee's strict locations/confidence/value structure"""
    return {
        "locations": [],
        "confidence": get_conf(),
        "value": val
    }

def generate_mindee_json(vendor, date_str, amount):
    # Calculate net and tax (assuming 21% VAT)
    net = round(amount / 1.21, 2)
    tax = round(amount - net, 2)
    fake_uuid = str(uuid.uuid4())
    
    return {
        "id": fake_uuid,
        "job": {"id": fake_uuid},
        "model": {"id": "4525d27d-e949-49a2-b2ee-a7ef6ee1ea4f"},
        "file": {
            "name": f"receipt_{random.randint(100, 999)}.jpg",
            "alias": None,
            "page_count": 1,
            "mime_type": "image/jpeg"
        },
        "result": {
            "fields": {
                "supplier_name": wrap(vendor["name"]),
                "supplier_address": wrap(None),
                "supplier_phone_number": wrap(None),
                "supplier_company_registration": {
                    "items": [
                        {
                            "locations": [],
                            "confidence": get_conf(),
                            "fields": {
                                "number": wrap(vendor["ico"]),
                                "type": wrap("ICO")
                            }
                        }
                    ],
                    "confidence": get_conf()
                },
                "receipt_number": wrap(f"DOC-{random.randint(1000, 9999)}"),
                "date": wrap(date_str),
                "time": wrap(None),
                "total_amount": wrap(amount),
                "total_net": wrap(net),
                "total_tax": wrap(tax),
                "taxes": {
                    "items": [
                        {
                            "locations": [],
                            "confidence": get_conf(),
                            "fields": {
                                "rate": wrap(0.21),
                                "base": wrap(net),
                                "amount": wrap(tax)
                            }
                        }
                    ],
                    "confidence": get_conf()
                },
                "tips_gratuity": wrap(None),
                "line_items": {
                    "items": [
                        {
                            "locations": [],
                            "confidence": get_conf(),
                            "fields": {
                                "description": wrap("Instalatérský materiál / Práce"),
                                "quantity": wrap(1),
                                "unit_price": wrap(net),
                                "total_price": wrap(amount)
                            }
                        }
                    ],
                    "confidence": get_conf()
                },
                "document_type": wrap("expense_receipt" if amount > 0 else "invoice"),
                "purchase_category": wrap(vendor["category"]),
                "purchase_subcategory": wrap(vendor["sub"]),
                "locale": {
                    "locations": [],
                    "confidence": get_conf(),
                    "fields": {
                        "language": wrap("cs"),
                        "country": wrap("CZ"),
                        "currency": wrap("CZK")
                    }
                }
            },
            "raw_text": None,
            "rag": None
        },
        "active_options": {
            "raw_text": False,
            "polygon": False,
            "confidence": True,
            "rag": False,
            "multipage_context": False,
            "text_context": False,
            "data_schema": {
                "replace": False
            }
        }
    }

def main():
    records = []
    current_id = START_ID
    
    # Track negative receipts for Jan (1) and Feb (2)
    negative_receipts = {"1": 0, "2": 0} 
    
    current_date = START_DATE
    while current_date <= END_DATE:
        month_str = str(current_date.month)
        
        # Determine if we should generate a receipt today (approx every 2 days)
        if random.random() < 0.45:
            is_income = False
            
            # Check if we need to force an income receipt this month (max 2 per month for Jan/Feb)
            if month_str in negative_receipts and negative_receipts[month_str] < 2:
                # Force income if we are nearing the end of the month and haven't hit the quota
                if random.random() < 0.15 or (current_date.day > 20 and negative_receipts[month_str] == 0):
                    is_income = True
                    negative_receipts[month_str] += 1
            
            if is_income:
                vendor = random.choice(INCOME_VENDORS)
                amount = round(random.uniform(-18000, -8000), 2) # Negative price for profit
            else:
                vendor = random.choice(EXPENSE_VENDORS)
                # Expenses between ~500 and ~3500 CZK
                amount = round(random.uniform(500, 3500), 2)
            
            date_str = current_date.strftime("%Y-%m-%d")
            # Randomize time of day slightly for realistic sorting
            hour = random.randint(8, 17)
            minute = random.randint(0, 59)
            timestamp_str = current_date.replace(hour=hour, minute=minute).strftime("%Y-%m-%dT%H:%M:%SZ")
            
            # Get the massive JSON block
            inference_data = generate_mindee_json(vendor, date_str, amount)
            
            records.append({
                "id": current_id,
                "created_at": timestamp_str,
                "image_url": IMAGE_URL,
                "inference": json.dumps(inference_data),
                "to_review": "false"
            })
            
            current_id += 1
            
        current_date += timedelta(days=1)

    # Write to CSV safely
    with open('mock_receipts.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "created_at", "image_url", "inference", "to_review"], quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(records)

    print(f"Generated {len(records)} records starting at ID {START_ID} in mock_receipts.csv")

if __name__ == "__main__":
    main()