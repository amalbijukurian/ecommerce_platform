from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.orm import relationship
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'User'
    UserID = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255), unique=True, nullable=False)
    Password = db.Column(db.String(255), nullable=False)
    Role = db.Column(db.String(50), default='customer')
    
    # Relationships
    cart = relationship('Cart', back_populates='user', uselist=False, cascade="all, delete-orphan")
    orders = relationship('Order', back_populates='user')
    reviews = relationship('Review', back_populates='user')

    def set_password(self, password):
        self.Password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.Password, password)

class Category(db.Model):
    __tablename__ = 'Category'
    CategoryID = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), unique=True, nullable=False)
    
    # Relationships
    products = relationship('Product', back_populates='category')

class Product(db.Model):
    __tablename__ = 'Product'
    ProductID = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    Price = db.Column(db.DECIMAL(10, 2), nullable=False)
    Stock = db.Column(db.Integer, nullable=False, default=0)
    CategoryID = db.Column(db.Integer, db.ForeignKey('Category.CategoryID'))
    
    # You had img_url in your frontend, but not your ERD. I'm adding it back
    # as it's essential for the frontend.
    img_url = db.Column(db.String(255))
    
    # Relationships
    category = relationship('Category', back_populates='products')
    reviews = relationship('Review', back_populates='product')

class Cart(db.Model):
    __tablename__ = 'Cart'
    CartID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('User.UserID'), unique=True, nullable=False)
    
    # Relationships
    user = relationship('User', back_populates='cart')
    items = relationship('CartItem', back_populates='cart', cascade="all, delete-orphan")

class CartItem(db.Model):
    __tablename__ = 'CartItem'
    CartItemID = db.Column(db.Integer, primary_key=True)
    CartID = db.Column(db.Integer, db.ForeignKey('Cart.CartID'), nullable=False)
    ProductID = db.Column(db.Integer, db.ForeignKey('Product.ProductID'), nullable=False)
    Quantity = db.Column(db.Integer, nullable=False, default=1)
    
    # Relationships
    cart = relationship('Cart', back_populates='items')
    product = relationship('Product') # Defines the link to Product

class Order(db.Model):
    __tablename__ = 'Order'
    OrderID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('User.UserID'))
    OrderDate = db.Column(db.DateTime, default=datetime.utcnow)
    TotalAmount = db.Column(db.DECIMAL(10, 2), nullable=False)
    Status = db.Column(db.String(50), nullable=False, default='Pending')
    
    # Relationships
    user = relationship('User', back_populates='orders')
    items = relationship('OrderItem', back_populates='order', cascade="all, delete-orphan")
    payment = relationship('Payment', back_populates='order', uselist=False, cascade="all, delete-orphan")

class OrderItem(db.Model):
    __tablename__ = 'OrderItem'
    OrderItemID = db.Column(db.Integer, primary_key=True)
    OrderID = db.Column(db.Integer, db.ForeignKey('Order.OrderID'), nullable=False)
    ProductID = db.Column(db.Integer, db.ForeignKey('Product.ProductID'))
    Quantity = db.Column(db.Integer, nullable=False)
    Price = db.Column(db.DECIMAL(10, 2), nullable=False) # Price at time of purchase
    
    # Relationships
    order = relationship('Order', back_populates='items')
    product = relationship('Product')

class Payment(db.Model):
    __tablename__ = 'Payment'
    PaymentID = db.Column(db.Integer, primary_key=True)
    OrderID = db.Column(db.Integer, db.ForeignKey('Order.OrderID'), nullable=False)
    PaymentDate = db.Column(db.DateTime, default=datetime.utcnow)
    Amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    PaymentMethod = db.Column(db.String(100))
    PaymentStatus = db.Column(db.String(50), nullable=False, default='Completed')
    
    # Relationships
    order = relationship('Order', back_populates='payment')

class Review(db.Model):
    __tablename__ = 'Review'
    ReviewID = db.Column(db.Integer, primary_key=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('Product.ProductID'), nullable=False)
    UserID = db.Column(db.Integer, db.ForeignKey('User.UserID'), nullable=False)
    Rating = db.Column(db.Integer, nullable=False)
    Comment = db.Column(db.Text)
    Date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship('Product', back_populates='reviews')
    user = relationship('User', back_populates='reviews')