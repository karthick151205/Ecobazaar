# export_products.py

import csv
from pymongo import MongoClient

# Connect to local MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ecobazar"]
collection = db["products"]

# Export file
csv_path = "data/products.csv"

# Fetch all products
products = list(collection.find({}))

if not products:
    print("❌ No products found in MongoDB!")
    exit()

# Create CSV
with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)

    # CSV header (must match recommender.py expectations)
    writer.writerow([
        "product_id",
        "name",
        "category",
        "description",
        "price",
        "carbon_footprint",
        "image_path"
    ])

    for p in products:
        writer.writerow([
            str(p["_id"]),                    # product_id
            p.get("name", ""),
            p.get("category", ""),
            p.get("description", ""),
            p.get("price", 0),
            p.get("ecoPoints", 0),            # carbon footprint = ecoPoints
            p.get("image", "")                # base64 OR URL
        ])

print(f"✅ Exported {len(products)} products → {csv_path}")
