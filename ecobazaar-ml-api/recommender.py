# recommender.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import numpy as np
import os


# ======================================================
# LOAD PRODUCTS FROM CSV
# ======================================================
def load_products(path="data/products.csv"):
    df = pd.read_csv(path)

    # Basic cleaning
    df["name"] = df["name"].fillna("")
    df["category"] = df["category"].fillna("")
    df["description"] = df["description"].fillna("")
    df["image_path"] = df.get("image_path", "").fillna("")
    df["carbon_footprint"] = df.get("carbon_footprint", 0).fillna(0)
    df["price"] = df.get("price", 0).fillna(0)

    # Convert product_id to string to avoid mismatch
    df["product_id"] = df["product_id"].astype(str)

    # Build combined meta-text (used for TF-IDF)
    df["meta"] = (
        df["name"] + " " +
        df["category"] + " " +
        df["description"]
    )

    return df


# ======================================================
# TRAIN MODEL
# ======================================================
def train_content_based(products_csv="data/products.csv",
                        out_model="models/cb_tfidf.joblib"):
    df = load_products(products_csv)

    # TF-IDF weight extraction
    tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
    tfidf_matrix = tfidf.fit_transform(df["meta"])

    os.makedirs("models", exist_ok=True)

    joblib.dump({
        "tfidf": tfidf,
        "matrix": tfidf_matrix,
        "df": df
    }, out_model)

    print("✅ Model trained & saved:", out_model)


# ======================================================
# LOAD MODEL
# ======================================================
def load_cb_model(path="models/cb_tfidf.joblib"):
    data = joblib.load(path)
    return data["tfidf"], data["matrix"], data["df"]


# ======================================================
# RECOMMEND SIMILAR PRODUCTS (Product ID input)
# ======================================================
def recommend_similar(product_id, top_n=5,
                      model_path="models/cb_tfidf.joblib"):

    tfidf, matrix, df = load_cb_model(model_path)

    # Convert incoming product_id to string
    product_id = str(product_id).strip()

    # Find index based on product_id (string match)
    try:
        idx = df.index[df["product_id"] == product_id].tolist()[0]
    except Exception:
        print("⚠️ Product ID not found:", product_id)
        return []

    # Cosine similarity
    sims = cosine_similarity(matrix[idx], matrix).flatten()
    sims[idx] = -1  # avoid recommending itself

    top_idx = np.argsort(sims)[::-1][:top_n]

    return df.iloc[top_idx][[
        "product_id", "name", "category",
        "carbon_footprint", "price", "image_path"
    ]].to_dict(orient="records")


# ======================================================
# CHATBOT TEXT SEARCH RECOMMENDATIONS
# ======================================================
def chatbot_recommend(message, top_n=5,
                      model_path="models/cb_tfidf.joblib"):

    tfidf, matrix, df = load_cb_model(model_path)

    msg_vec = tfidf.transform([message])
    sims = cosine_similarity(msg_vec, matrix).flatten()

    top_idx = np.argsort(sims)[::-1][:top_n]

    return df.iloc[top_idx][[
        "product_id", "name", "category",
        "carbon_footprint", "price", "image_path"
    ]].to_dict(orient="records")
