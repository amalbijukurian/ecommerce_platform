from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from sqlalchemy.exc import IntegrityError
from config import Config
from models import db, bcrypt, User, Category, Product, Cart, CartItem, Order, OrderItem, Payment, Review
from datetime import datetime

# --- App Initialization ---
app = Flask(__name__)
app.config.from_object(Config)

# --- Extensions Initialization ---
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8000', 'http://127.0.0.1:8000', 'file://']) # Allow frontend to make requests

# --- Helper Functions ---

# Define how to get the user from the JWT token
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.get(identity)

# --- Error Handlers ---
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found"}), 404

# --- API Routes ---

# === Auth Routes ===
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(Email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    try:
        user = User(Name=name, Email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.flush() # Get the new UserID

        # Create a cart for the new user
        cart = Cart(UserID=user.UserID)
        db.session.add(cart)
        
        db.session.commit()
        
        return jsonify({"message": f"User {name} registered successfully."}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(Email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.UserID)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"error": "Invalid email or password"}), 401


# === Public Data Routes ===

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    # Manually serialize the data
    category_list = [
        {"CategoryID": cat.CategoryID, "Name": cat.Name} 
        for cat in categories
    ]
    return jsonify(category_list), 200

@app.route('/api/products', methods=['GET'])
def get_products():
    # Get query parameters
    category_id = request.args.get('category')
    search_term = request.args.get('search')
    
    query = Product.query
    
    if category_id:
        query = query.filter(Product.CategoryID == category_id)
        
    if search_term:
        query = query.filter(Product.Name.ilike(f'%{search_term}%'))
        
    products = query.all()
    
    # Manually serialize the data
    product_list = [
        {
            "ProductID": p.ProductID,
            "Name": p.Name,
            "Description": p.Description,
            "Price": float(p.Price), # Convert Decimal to float
            "Stock": p.Stock,
            "CategoryID": p.CategoryID,
            "img_url": p.img_url,
            "CategoryName": p.category.Name if p.category else None
        } for p in products
    ]
    return jsonify(product_list), 200

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        "ProductID": product.ProductID,
        "Name": product.Name,
        "Description": product.Description,
        "Price": float(product.Price),
        "Stock": product.Stock,
        "CategoryID": product.CategoryID,
        "img_url": product.img_url,
        "CategoryName": product.category.Name if product.category else None
    }), 200

@app.route('/api/products/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    reviews = Review.query.filter_by(ProductID=product_id).all()
    review_list = [
        {
            "ReviewID": r.ReviewID,
            "Rating": r.Rating,
            "Comment": r.Comment,
            "Date": r.Date.isoformat(),
            "UserName": r.user.Name
        } for r in reviews
    ]
    return jsonify(review_list), 200

# === Cart Routes (Protected) ===

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user = get_jwt_identity() # This is the UserID
    cart = Cart.query.filter_by(UserID=user).first_or_404()
    
    cart_items = []
    for item in cart.items:
        cart_items.append({
            "CartItemID": item.CartItemID,
            "ProductID": item.ProductID,
            "Quantity": item.Quantity,
            "Name": item.product.Name,
            "Price": float(item.product.Price),
            "img_url": item.product.img_url
        })
        
    return jsonify(cart_items), 200

@app.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('productId')
    quantity = data.get('quantity', 1)

    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400

    cart = Cart.query.filter_by(UserID=user_id).first_or_404()
    
    # Check if item is already in cart
    existing_item = CartItem.query.filter_by(CartID=cart.CartID, ProductID=product_id).first()
    
    if existing_item:
        existing_item.Quantity += quantity
    else:
        new_item = CartItem(CartID=cart.CartID, ProductID=product_id, Quantity=quantity)
        db.session.add(new_item)
    
    db.session.commit()
    return jsonify({"message": "Item added to cart"}), 201

@app.route('/api/cart/item/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_item_id):
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(UserID=user_id).first_or_404()
    
    item = CartItem.query.filter_by(CartItemID=cart_item_id, CartID=cart.CartID).first()
    
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item removed from cart"}), 200
    
    return jsonify({"error": "Item not found in cart"}), 404

# === Wishlist Routes (Protected) ===

@app.route('/api/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    # For now, return empty wishlist - you can implement wishlist functionality later
    return jsonify([]), 200

@app.route('/api/wishlist', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('productId')
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
    
    # For now, just return success - implement wishlist functionality later
    return jsonify({"message": "Added to wishlist"}), 201

@app.route('/api/wishlist/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    user_id = get_jwt_identity()
    # For now, just return success - implement wishlist functionality later
    return jsonify({"message": "Removed from wishlist"}), 200

# === Order Routes (Protected) ===

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def place_order():
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(UserID=user_id).first_or_404()
    
    if not cart.items:
        return jsonify({"error": "Cart is empty"}), 400

    total_amount = 0
    order_items_to_create = []

    try:
        # Calculate total and prepare order items
        for item in cart.items:
            product = item.product
            if product.Stock < item.Quantity:
                return jsonify({"error": f"Not enough stock for {product.Name}"}), 400
            
            price = product.Price
            total_amount += (price * item.Quantity)
            
            order_items_to_create.append({
                "ProductID": item.ProductID,
                "Quantity": item.Quantity,
                "Price": price
            })
            
            # Reduce stock
            product.Stock -= item.Quantity

        # Create the Order
        new_order = Order(UserID=user_id, TotalAmount=total_amount, Status='Pending')
        db.session.add(new_order)
        db.session.flush() # To get the new_order.OrderID

        # Create OrderItems
        for item_data in order_items_to_create:
            order_item = OrderItem(
                OrderID=new_order.OrderID,
                ProductID=item_data["ProductID"],
                Quantity=item_data["Quantity"],
                Price=item_data["Price"]
            )
            db.session.add(order_item)

        # Create a mock Payment
        new_payment = Payment(
            OrderID=new_order.OrderID,
            Amount=total_amount,
            PaymentMethod="Mock Credit Card",
            PaymentStatus="Completed"
        )
        db.session.add(new_payment)
        
        # Clear the cart
        CartItem.query.filter_by(CartID=cart.CartID).delete()
        
        db.session.commit()
        
        return jsonify({
            "message": "Order placed successfully!",
            "OrderID": new_order.OrderID
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Order placement failed: {str(e)}"}), 500

# === Main execution ---
if __name__ == '__main__':
    try:
        # Create tables if they don't exist
        with app.app_context():
            db.create_all()
            print("Database tables created successfully")
            
            # Add sample data if database is empty
            if Category.query.count() == 0:
                print("Adding sample data...")
                # Add categories
                categories = [
                    Category(Name='Stationery'),
                    Category(Name='Plush Toys'),
                    Category(Name='Beauty'),
                    Category(Name='Home Decor')
                ]
                for cat in categories:
                    db.session.add(cat)
                db.session.commit()
                
                # Add products
                products = [
                    Product(Name='Kawaii Cat Pen', CategoryID=1, Price=79, Stock=100, 
                           img_url='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
                           Description='Cute and comfy cat-shaped pen for your class notes or journal. Writes smoothly in blue ink.'),
                    Product(Name='Pastel Bunny Plush', CategoryID=2, Price=349, Stock=100,
                           img_url='https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg?auto=compress&w=400',
                           Description='Soft, huggable bunny plush with pastel colors. Perfect for gifts and cozy naps.'),
                    Product(Name='Lavender Hand Cream', CategoryID=3, Price=139, Stock=100,
                           img_url='https://images.pexels.com/photos/2270834/pexels-photo-2270834.jpeg?auto=compress&w=400',
                           Description='Light lavender-scented hand cream. Moisturizes and softens for silky smooth hands.'),
                    Product(Name='Cloud Pillow', CategoryID=4, Price=260, Stock=100,
                           img_url='https://images.unsplash.com/photo-1526178613658-3e1f28221885?auto=format&fit=crop&w=400&q=80',
                           Description='Dreamy pillow in cloud shape with smiley face. Ultra-soft for beds and sofas.')
                ]
                for prod in products:
                    db.session.add(prod)
                db.session.commit()
                
                print("Sample data added to database")
            else:
                print("Database already has data")
        
        print("Starting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5000) # debug=True for development
        
    except Exception as e:
        print(f"Error starting application: {e}")
        print("Please check your database connection settings in the .env file")