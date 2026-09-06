"""
=============================================================================
MEVUKA - Premium Dry Fruits E-Commerce API & Server
=============================================================================
This Flask application serves the REST API endpoints for Mevuka:
  - Products catalog (/api/products)
  - Cart operations (/api/cart)
  - Contact form processing (/api/contact)
  - Static frontend serving (optional direct access via http://localhost:5000)

Author: Mevuka Dev Team
=============================================================================
"""

import os
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Initialize Flask app
# Static folder is set to the sibling 'frontend' directory so running 'python app.py'
# lets you immediately view the complete site at http://localhost:5000
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")

# Enable Cross-Origin Resource Sharing (CORS) so frontend can communicate
# with this backend even if served from another port or Live Server
CORS(app)

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRODUCTS_FILE = os.path.join(BASE_DIR, "products.json")
INQUIRIES_FILE = os.path.join(BASE_DIR, "inquiries.json")

# In-memory Cart storage for the active session (keyed by product_id)
# Format: { product_id: { "product": {...}, "quantity": 2 } }
cart_store = {}


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def load_products():
    """Load products from the JSON database file."""
    if not os.path.exists(PRODUCTS_FILE):
        return []
    try:
        with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error] Failed to read products.json: {e}")
        return []

def save_inquiry(inquiry_data):
    """Append a new contact form inquiry to inquiries.json."""
    inquiries = []
    if os.path.exists(INQUIRIES_FILE):
        try:
            with open(INQUIRIES_FILE, "r", encoding="utf-8") as f:
                inquiries = json.load(f)
        except Exception:
            inquiries = []

    inquiries.append(inquiry_data)

    try:
        with open(INQUIRIES_FILE, "w", encoding="utf-8") as f:
            json.dump(inquiries, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"[Error] Failed to save inquiry: {e}")
        return False

def calculate_cart_summary():
    """Calculate items list, total count, and total price of current cart."""
    items = list(cart_store.values())
    total_items = sum(item["quantity"] for item in items)
    subtotal = sum(item["product"]["price"] * item["quantity"] for item in items)
    
    # Shipping rule: Free shipping above ₹999, else ₹60 flat rate
    free_shipping_threshold = 999
    shipping_fee = 0 if (subtotal >= free_shipping_threshold or subtotal == 0) else 60
    grand_total = subtotal + shipping_fee

    return {
        "items": items,
        "total_items": total_items,
        "subtotal": subtotal,
        "shipping_fee": shipping_fee,
        "free_shipping_threshold": free_shipping_threshold,
        "grand_total": grand_total
    }


# =============================================================================
# API ENDPOINTS: PRODUCTS
# =============================================================================

@app.route("/api/products", methods=["GET"])
def get_products():
    """
    GET /api/products
    Query parameters (optional):
      - category: filter by category key (e.g. 'nuts', 'dried_fruits', 'seeds_gourmet')
      - search: search keyword in name or description
    """
    products = load_products()
    category = request.args.get("category", "").strip().lower()
    search = request.args.get("search", "").strip().lower()

    filtered = products
    if category and category != "all":
        filtered = [p for p in filtered if p.get("category", "").lower() == category]

    if search:
        filtered = [
            p for p in filtered
            if search in p.get("name", "").lower() or search in p.get("description", "").lower()
        ]

    return jsonify({
        "success": True,
        "count": len(filtered),
        "products": filtered
    }), 200


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """
    GET /api/products/<id>
    Retrieve a single product by its unique numeric ID.
    """
    products = load_products()
    product = next((p for p in products if p.get("id") == product_id), None)
    if not product:
        return jsonify({
            "success": False,
            "error": f"Product with ID {product_id} not found."
        }), 404

    return jsonify({
        "success": True,
        "product": product
    }), 200


# =============================================================================
# API ENDPOINTS: CART
# =============================================================================

@app.route("/api/cart", methods=["GET"])
def get_cart():
    """
    GET /api/cart
    Returns the current shopping cart state, items, and totals.
    """
    return jsonify({
        "success": True,
        "cart": calculate_cart_summary()
    }), 200


@app.route("/api/cart", methods=["POST"])
def add_to_cart():
    """
    POST /api/cart
    JSON Body:
      {
        "product_id": 1,
        "quantity": 1  (default: 1)
      }
    """
    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if product_id is None:
        return jsonify({
            "success": False,
            "error": "Field 'product_id' is required."
        }), 400

    try:
        product_id = int(product_id)
        quantity = int(quantity)
        if quantity <= 0:
            return jsonify({"success": False, "error": "Quantity must be greater than 0."}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Invalid product_id or quantity format."}), 400

    products = load_products()
    product = next((p for p in products if p.get("id") == product_id), None)
    if not product:
        return jsonify({"success": False, "error": f"Product {product_id} not found."}), 404

    # Add or increment quantity in cart
    if product_id in cart_store:
        cart_store[product_id]["quantity"] += quantity
    else:
        cart_store[product_id] = {
            "product_id": product_id,
            "product": product,
            "quantity": quantity
        }

    return jsonify({
        "success": True,
        "message": f"Added {product['name']} to cart.",
        "cart": calculate_cart_summary()
    }), 200


@app.route("/api/cart/<int:product_id>", methods=["PUT"])
def update_cart_item(product_id):
    """
    PUT /api/cart/<product_id>
    JSON Body:
      {
        "quantity": 3
      }
    Setting quantity to 0 removes the item.
    """
    if product_id not in cart_store:
        return jsonify({"success": False, "error": "Item not in cart."}), 404

    data = request.get_json(silent=True) or {}
    if "quantity" not in data:
        return jsonify({"success": False, "error": "Field 'quantity' is required."}), 400

    try:
        quantity = int(data["quantity"])
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Quantity must be an integer."}), 400

    if quantity <= 0:
        removed = cart_store.pop(product_id)
        return jsonify({
            "success": True,
            "message": f"Removed {removed['product']['name']} from cart.",
            "cart": calculate_cart_summary()
        }), 200

    cart_store[product_id]["quantity"] = quantity
    return jsonify({
        "success": True,
        "message": "Cart updated successfully.",
        "cart": calculate_cart_summary()
    }), 200


@app.route("/api/cart/<int:product_id>", methods=["DELETE"])
def remove_from_cart(product_id):
    """
    DELETE /api/cart/<product_id>
    Removes a specific product from the cart.
    """
    if product_id not in cart_store:
        return jsonify({"success": False, "error": "Item not found in cart."}), 404

    removed = cart_store.pop(product_id)
    return jsonify({
        "success": True,
        "message": f"Removed {removed['product']['name']} from cart.",
        "cart": calculate_cart_summary()
    }), 200


@app.route("/api/cart", methods=["DELETE"])
def clear_cart():
    """
    DELETE /api/cart
    Clears all items from the cart.
    """
    cart_store.clear()
    return jsonify({
        "success": True,
        "message": "Cart cleared.",
        "cart": calculate_cart_summary()
    }), 200


# =============================================================================
# API ENDPOINTS: CONTACT
# =============================================================================

@app.route("/api/contact", methods=["POST"])
def submit_contact():
    """
    POST /api/contact
    JSON Body:
      {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "message": "I would like to inquire about bulk ordering.",
        "subject": "Bulk Inquiry" (optional)
      }
    """
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()
    subject = data.get("subject", "General Inquiry").strip()

    # Basic input validations
    errors = []
    if not name:
        errors.append("Name is required.")
    if not email or "@" not in email:
        errors.append("A valid email address is required.")
    if not message:
        errors.append("Message cannot be empty.")

    if errors:
        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    inquiry_record = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "name": name,
        "email": email,
        "subject": subject,
        "message": message
    }

    save_inquiry(inquiry_record)

    return jsonify({
        "success": True,
        "message": f"Thank you, {name}! Your message has been received. Our team will contact you shortly.",
        "inquiry": inquiry_record
    }), 201


# =============================================================================
# FRONTEND STATIC SERVING (For easy local execution)
# =============================================================================

@app.route("/")
def serve_index():
    """Serve frontend index.html when accessing root URL."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def serve_static_files(path):
    """Serve any static file (style.css, script.js, images) from frontend."""
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    # If file doesn't exist, fall back to index.html for single-page routing
    return send_from_directory(FRONTEND_DIR, "index.html")


# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.errorhandler(404)
def handle_404(e):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "API route not found"}), 404
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.errorhandler(500)
def handle_500(e):
    return jsonify({"success": False, "error": "Internal server error"}), 500


# =============================================================================
# MAIN ENTRYPOINT
# =============================================================================

if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Mevuka Dry Fruits Server running on http://127.0.0.1:{port}")
    print(f"[*] API Endpoints: /api/products, /api/cart, /api/contact")
    print(f"[*] Serving frontend from: {FRONTEND_DIR}")
    app.run(host="0.0.0.0", port=port, debug=False)

