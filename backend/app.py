from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ⚡ SAME FORMAT AS YOUR REACT PRODUCTS
eco_products = [
    {
        "id": 1,
        "name": "Organic Cotton Tote Bag",
        "price": 499,
        "ecoPoints": 85,
        "category": "Accessories",
        "rating": 4.3,
        "image": "https://cdn.pixabay.com/photo/2016/11/19/11/11/bag-1833926_960_720.jpg",
        "description": "Durable and eco-friendly cotton tote bag for everyday use."
    },
    {
        "id": 2,
        "name": "Bamboo Toothbrush Set",
        "price": 299,
        "ecoPoints": 92,
        "category": "Home",
        "rating": 4.5,
        "image": "https://cdn.pixabay.com/photo/2020/08/17/15/13/toothbrush-5495506_960_720.jpg",
        "description": "Biodegradable bamboo toothbrushes that reduce plastic waste."
    },
    {
        "id": 3,
        "name": "Solar Power Bank",
        "price": 899,
        "ecoPoints": 90,
        "category": "Electronics",
        "rating": 4.6,
        "image": "https://m.media-amazon.com/images/I/71V0H0yJd2L.jpg",
        "description": "Charge your devices on the go using clean solar energy."
    },
    {
        "id": 4,
        "name": "Handcrafted Jute Bag",
        "price": 399,
        "ecoPoints": 88,
        "category": "Accessories",
        "rating": 4.3,
        "image": "https://m.media-amazon.com/images/I/81iQGa0ZjGL.jpg",
        "description": "Beautiful handcrafted bag made from natural jute fibers."
    },
]

@app.route("/")
def home():
    return jsonify({"message": "EcoBazaar Recommender API Running 🌿"})

# 🔹 GET ALL PRODUCTS (Optional for future use)
@app.route("/products")
def products():
    return jsonify({"products": eco_products})

# 🔹 POST → Recommend Products
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_data = data.get("user_data", {})

    # 🔸 Simple logic
    preferred_category = user_data.get("category")
    min_ecopoints = user_data.get("minEco", 0)

    recommended = [
        p for p in eco_products
        if (not preferred_category or p["category"] == preferred_category)
        and p["ecoPoints"] >= min_ecopoints
    ]

    # fallback → return all
    if not recommended:
        recommended = eco_products

    return jsonify({"recommendations": recommended})

if __name__ == "__main__":
    print("🌿 API Ready at: http://127.0.0.1:5000")
    app.run(debug=True)
