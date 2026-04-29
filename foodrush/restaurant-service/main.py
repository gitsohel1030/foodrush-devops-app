from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os, time

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://foodrush:foodrush123@restaurant-db:5432/restaurantdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    cuisine = Column(String)
    rating = Column(Float, default=4.0)
    delivery_time = Column(String, default="30-45 min")
    image_url = Column(String)
    description = Column(Text)
    is_open = Column(Integer, default=1)

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer)
    name = Column(String)
    price = Column(Float)
    category = Column(String)
    description = Column(Text)
    emoji = Column(String, default="🍽️")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FoodRush Restaurant Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_data(db: Session):
    if db.query(Restaurant).count() > 0:
        return
    restaurants = [
        Restaurant(id=1, name="Burger Bae", cuisine="American", rating=4.8, delivery_time="20-30 min",
                   image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
                   description="Juicy smash burgers that slap different 🔥"),
        Restaurant(id=2, name="Sushi Sensei", cuisine="Japanese", rating=4.9, delivery_time="35-45 min",
                   image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
                   description="No cap, the freshest sushi in town 🍣"),
        Restaurant(id=3, name="Pizza Gang", cuisine="Italian", rating=4.7, delivery_time="25-35 min",
                   image_url="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
                   description="Wood-fired pizzas bussin fr fr 🍕"),
        Restaurant(id=4, name="Taco Tribe", cuisine="Mexican", rating=4.6, delivery_time="15-25 min",
                   image_url="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400",
                   description="Street tacos that hit different every time 🌮"),
    ]
    menu_items = [
        # Burger Bae
        MenuItem(restaurant_id=1, name="Smash Burger", price=12.99, category="Burgers", emoji="🍔", description="Double smash patty, cheddar, special sauce"),
        MenuItem(restaurant_id=1, name="Crispy Chicken", price=11.99, category="Burgers", emoji="🍗", description="Nashville hot crispy chicken sandwich"),
        MenuItem(restaurant_id=1, name="Truffle Fries", price=5.99, category="Sides", emoji="🍟", description="Shoestring fries with truffle oil & parmesan"),
        MenuItem(restaurant_id=1, name="Oreo Shake", price=6.99, category="Drinks", emoji="🥤", description="Thick oreo milkshake topped with whipped cream"),
        # Sushi Sensei
        MenuItem(restaurant_id=2, name="Dragon Roll", price=16.99, category="Rolls", emoji="🍣", description="Shrimp tempura, avocado, topped with eel"),
        MenuItem(restaurant_id=2, name="Salmon Nigiri x4", price=12.99, category="Nigiri", emoji="🐟", description="Premium Atlantic salmon over seasoned rice"),
        MenuItem(restaurant_id=2, name="Miso Ramen", price=14.99, category="Hot", emoji="🍜", description="Rich miso broth with chashu pork & soft egg"),
        MenuItem(restaurant_id=2, name="Matcha Mochi", price=5.99, category="Dessert", emoji="🍡", description="House-made matcha ice cream mochi"),
        # Pizza Gang
        MenuItem(restaurant_id=3, name="Margherita OG", price=13.99, category="Pizza", emoji="🍕", description="San Marzano tomato, fresh mozzarella, basil"),
        MenuItem(restaurant_id=3, name="Pepperoni Storm", price=15.99, category="Pizza", emoji="🔥", description="Cup & char pepperoni, triple cheese blend"),
        MenuItem(restaurant_id=3, name="Garlic Knots", price=4.99, category="Sides", emoji="🧄", description="Buttery garlic knots with marinara dip"),
        # Taco Tribe
        MenuItem(restaurant_id=4, name="Al Pastor Tacos x3", price=10.99, category="Tacos", emoji="🌮", description="Marinated pork, pineapple, cilantro, onion"),
        MenuItem(restaurant_id=4, name="Loaded Nachos", price=9.99, category="Sharing", emoji="🧀", description="Tortilla chips loaded with all the goods"),
        MenuItem(restaurant_id=4, name="Churros", price=5.99, category="Dessert", emoji="🍩", description="Cinnamon sugar churros with chocolate dip"),
    ]
    for r in restaurants:
        db.add(r)
    for m in menu_items:
        db.add(m)
    db.commit()

@app.on_event("startup")
def startup():
    db = SessionLocal()
    seed_data(db)
    db.close()

@app.get("/health")
def health():
    return {"status": "healthy", "service": "restaurant-service", "timestamp": datetime.utcnow()}

@app.get("/metrics")
def metrics():
    return {"service": "restaurant-service", "uptime": time.time(), "status": "up"}

@app.get("/api/restaurants")
def list_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).filter(Restaurant.is_open == 1).all()

@app.get("/api/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return r

@app.get("/api/restaurants/{restaurant_id}/menu")
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return items

@app.get("/api/menu/all")
def all_menu(db: Session = Depends(get_db)):
    return db.query(MenuItem).all()
