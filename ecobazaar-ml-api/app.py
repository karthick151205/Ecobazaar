# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from recommender import recommend_similar, chatbot_recommend, load_products
import re

app = Flask(__name__)
CORS(app)

# --------------------------------------------------------
# Extract product ID from message
# --------------------------------------------------------
def extract_product_id(message):
    numbers = re.findall(r'\b\d+\b', message)
    if numbers:
        try:
            return int(numbers[0])
        except ValueError:
            return None
    return None

# --------------------------------------------------------
# Chatbot text formatter
# --------------------------------------------------------
def generate_chatbot_response(message, recommendations):
    if not recommendations:
        return "I couldn't find any matching eco-friendly products. Try again 😊"

    text = f"I found {len(recommendations)} eco-friendly product(s):\n\n"
    for i, r in enumerate(recommendations, 1):
        text += (
            f"{i}. **{r['name']}** ({r['category']})\n"
            f"   💰 Price: ₹{r['price']}\n"
            f"   🌱 CO₂: {r['carbon_footprint']} kg\n"
            f"   🆔 ID: {r['product_id']}\n\n"
        )
    return text

# --------------------------------------------------------
# Home health message
# --------------------------------------------------------
@app.route("/")
def home():
    return jsonify({"message": "EcoBazaar ML Recommender API running!"})

# --------------------------------------------------------
# Fix Unsplash images
# --------------------------------------------------------
def fix_image_url(url):
    if not url:
        return None
    if "unsplash.com" in url:
        if "/photo-" in url:
            match = re.search(r'photo-([a-zA-Z0-9-]+)', url)
            if match:
                pid = match.group(1)
                return f"https://images.unsplash.com/photo-{pid}?w=400&h=300&fit=crop&q=80&auto=format"
        sep = "?" if "?" not in url else "&"
        return f"{url}{sep}w=400&h=300&fit=crop&q=80&auto=format"
    return url

# --------------------------------------------------------
# PRODUCT → PRODUCT Recommendation (FBT section)
# --------------------------------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    product_id = data.get("product_id")

    if product_id is None:
        return jsonify({"error": "product_id is required"}), 400

    try:
        recs = recommend_similar(product_id)

        transformed = []
        for r in recs:
            img = fix_image_url(r.get("image_path"))
            transformed.append({
                "product_id": r["product_id"],
                "name": r["name"],
                "category": r["category"],
                "price": r["price"],
                "carbon_footprint": r["carbon_footprint"],
                "image": img,
            })

        return jsonify({"recommendations": transformed})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e), "recommendations": []}), 500

# --------------------------------------------------------
# HOMEPAGE ML RECOMMENDATIONS
# --------------------------------------------------------
@app.route("/recommendations", methods=["GET", "POST"])
def recommendations():
    try:
        if request.method == "GET":
            top_n = int(request.args.get("top_n", 6))
        else:
            top_n = request.get_json().get("top_n", 6)

        try:
            recs = chatbot_recommend("eco-friendly sustainable products", top_n=top_n)
        except:
            df = load_products()
            recs = df.head(top_n).to_dict(orient="records")

        transformed = []
        for r in recs:
            img = fix_image_url(r.get("image_path"))
            transformed.append({
                "product_id": r["product_id"],
                "name": r["name"],
                "category": r["category"],
                "price": f"₹{r['price']}",
                "carbon_footprint": r["carbon_footprint"],
                "carbon": f"{r['carbon_footprint']} kg CO₂e",
                "image": img,
            })

        return jsonify({"recommendations": transformed})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"recommendations": [], "error": str(e)}), 500

# --------------------------------------------------------
# CHATBOT FULL LOGIC (category + ID + free text)
# --------------------------------------------------------
@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()

    if not data or "message" not in data:
        return jsonify({"error": "message required"}), 400

    message = data["message"].strip().lower()

    # Greetings
    if message in ["hi", "hello", "hey", "hai", "hlo"]:
        return jsonify({
            "response": "Hello 👋! How can I help you today?",
            "recommendations": [],
            "message": message
        })

    # Help Menu
    if "help" in message or "menu" in message:
        return jsonify({
            "response": "You can ask me:\n• Home items\n• Kitchen\n• Clothing\n• Accessories\n• Product ID (ex: 'show product 3')",
            "recommendations": [],
            "message": message
        })

    # CATEGORY FILTER
    categories = ["home", "kitchen", "clothing", "accessories"]
    for cat in categories:
        if cat in message:
            df = load_products()
            filtered = df[df["category"].str.lower() == cat].to_dict(orient="records")
            return jsonify({
                "response": f"Here are some {cat} items you may like:",
                "recommendations": [
                    {
                        "product_id": r["product_id"],
                        "name": r["name"],
                        "category": r["category"],
                        "price": r["price"],
                        "carbon_footprint": r["carbon_footprint"],
                        "image": fix_image_url(r["image_path"])
                    }
                    for r in filtered
                ],
                "message": message
            })

    # PRODUCT ID SEARCH
    product_id = extract_product_id(message)
    if product_id:
        recs = recommend_similar(product_id)
        return jsonify({
            "response": generate_chatbot_response(message, recs),
            "recommendations": recs,
            "message": message
        })

    # GENERAL SEARCH
    recs = chatbot_recommend(message, top_n=data.get("top_n", 5))
    return jsonify({
        "response": generate_chatbot_response(message, recs),
        "recommendations": recs,
        "message": message
    })

# --------------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------------
@app.route("/chatbot/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "EcoBazaar Chatbot"
    })

# --------------------------------------------------------
# MAIN
# --------------------------------------------------------
if __name__ == "__main__":
    print("🌿 EcoBazaar ML API running at http://127.0.0.1:5000")
    app.run(debug=True)
