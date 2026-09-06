# 🌰 Mevuka - Artisanal Dry Fruits & Gourmet Nuts

An elegant full-stack e-commerce website built for **Mevuka**, an artisanal dry fruits business specializing in single-origin, vacuum-sealed **250gm packets**.

Designed with an **earthy, rustic-luxury aesthetic** (deep espresso browns, warm oat cream, antique gold foil accents, and Google Fonts typography).

---

## 📁 Project Architecture

```
Mevuka/
├── backend/                  # Python Flask Server & Data Store
│   ├── app.py                # Main Flask API and static file server
│   ├── products.json         # Easily editable JSON database of products
│   ├── inquiries.json        # Contact form inquiries stored here
│   └── requirements.txt      # Python dependencies (Flask, Flask-CORS)
│
├── frontend/                 # Client-side UI
│   ├── index.html            # Semantic HTML5 layout
│   ├── style.css             # Vanilla CSS design system & responsiveness
│   ├── script.js             # Client controller & Fetch API integrations
│   └── assets/               # Generated high-resolution product photography
│       ├── hero_banner.jpg   # Artisanal assortment hero image
│       ├── almonds.jpg       # California Almonds
│       ├── cashews.jpg       # Whole Ivory Cashews
│       ├── walnuts.jpg       # Extra-Light Kashmiri Walnut Halves
│       ├── pistachios.jpg    # Roasted & Salted Green Pistachios
│       ├── raisins.jpg       # Golden Seedless Raisins
│       ├── dates.jpg         # Royal Medjool Dates
│       ├── apricots.jpg      # Sun-Dried Turkish Apricots
│       ├── figs.jpg          # Artisanal Turkish Anjeer String Figs
│       ├── black_currants.jpg# Tart Anthocyanin-Rich Black Currants
│       └── pine_nuts.jpg     # Wild Himalayan Chilgoza Pine Nuts
│
└── README.md                 # Project guide & local setup instructions
```

---

## 🚀 Quick Start (How to Run Locally)

### Step 1: Install Dependencies
Open your terminal in the `Mevuka` directory and install the required Python packages:

```bash
pip install -r backend/requirements.txt
```

### Step 2: Start the Backend & Website
Run the Flask server:

```bash
python backend/app.py
```

### Step 3: View the Website
Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

*Note: The Flask application is configured to serve both the REST API and the `/frontend` static files simultaneously. You can also open `frontend/index.html` directly with VS Code Live Server or a browser—the JavaScript client automatically connects across ports using CORS.*

---

## ✏️ How to Edit Products (Names, Prices, Images)

All product information is organized cleanly in `backend/products.json`. To modify any product:

1. Open `backend/products.json` in your favorite text editor.
2. Find the product object by `id` or `name`.
3. Edit any field:
   ```json
   {
     "id": 1,
     "name": "Almonds (California)",
     "category": "nuts",
     "category_name": "Premium Nuts",
     "price": 340,
     "weight": "250gm",
     "rating": 4.9,
     "reviews_count": 128,
     "in_stock": true,
     "badge": "Best Seller",
     "origin": "California, USA",
     "description": "Hand-selected, jumbo-sized California almonds...",
     "benefits": ["Rich in Vitamin E", "Heart Healthy", "Brain Vitality"],
     "image": "assets/almonds.jpg"
   }
   ```
4. Save the file and refresh your browser!

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all dry fruits (supports `?category=` and `?search=` filters) |
| `GET` | `/api/products/<id>` | Retrieve a single product by ID |
| `GET` | `/api/cart` | Get current cart items, subtotal, and grand total |
| `POST` | `/api/cart` | Add product to cart `{ "product_id": 1, "quantity": 1 }` |
| `PUT` | `/api/cart/<id>` | Update quantity of an item in cart `{ "quantity": 3 }` |
| `DELETE` | `/api/cart/<id>` | Remove specific item from cart |
| `DELETE` | `/api/cart` | Clear entire cart |
| `POST` | `/api/contact` | Submit contact form inquiry (saved to `inquiries.json`) |

---

## 🎨 Design & Features

- **Luxury Palette**: Warm espresso browns (`#24160E`), creamy linen background (`#FAF6F0`), and antique gold accents (`#C59442`).
- **Interactive Slide-Out Cart**: Real-time quantity adjustments, free shipping progress meter (orders above ₹999), and order breakdown.
- **Dynamic Search & Filtering**: Instant search across 10 items and category pill filters.
- **Form Validation & Persistence**: Contact form inquiries are validated and automatically saved into `backend/inquiries.json`.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile displays.
