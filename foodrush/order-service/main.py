from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import List
import os, time, random

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://foodrush:foodrush123@order-db:5432/orderdb")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

STATUSES = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"]

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    restaurant_id = Column(Integer)
    restaurant_name = Column(String)
    items = Column(Text)
    total_amount = Column(Float)
    status = Column(String, default="placed")
    delivery_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    estimated_delivery = Column(String, default="30-45 min")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FoodRush Order Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OrderItem(BaseModel):
    name: str
    price: float
    quantity: int
    emoji: str = "🍽️"

class PlaceOrderRequest(BaseModel):
    user_id: int
    restaurant_id: int
    restaurant_name: str
    items: List[OrderItem]
    delivery_address: str = "123 Main St"

@app.get("/health")
def health():
    return {"status": "healthy", "service": "order-service", "timestamp": datetime.utcnow()}

@app.get("/metrics")
def metrics():
    return {"service": "order-service", "uptime": time.time(), "status": "up"}

@app.post("/api/orders")
def place_order(req: PlaceOrderRequest, db: Session = Depends(get_db)):
    total = sum(item.price * item.quantity for item in req.items)
    items_str = "|".join([f"{i.emoji}{i.name}x{i.quantity}@{i.price}" for i in req.items])
    order = Order(
        user_id=req.user_id,
        restaurant_id=req.restaurant_id,
        restaurant_name=req.restaurant_name,
        items=items_str,
        total_amount=round(total, 2),
        delivery_address=req.delivery_address,
        estimated_delivery=f"{random.randint(25, 45)}-{random.randint(45, 60)} min"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {
        "order_id": order.id,
        "status": order.status,
        "total": order.total_amount,
        "estimated_delivery": order.estimated_delivery,
        "message": "Order placed successfully!!! 🎉"
    }

@app.get("/api/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": order.id,
        "user_id": order.user_id,
        "restaurant_name": order.restaurant_name,
        "items": order.items,
        "total_amount": order.total_amount,
        "status": order.status,
        "delivery_address": order.delivery_address,
        "estimated_delivery": order.estimated_delivery,
        "created_at": order.created_at
    }

@app.get("/api/orders/user/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    return [{"id": o.id, "restaurant_name": o.restaurant_name, "total_amount": o.total_amount,
             "status": o.status, "created_at": o.created_at} for o in orders]

@app.patch("/api/orders/{order_id}/status")
def update_status(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    current_idx = STATUSES.index(order.status) if order.status in STATUSES else 0
    if current_idx < len(STATUSES) - 1:
        order.status = STATUSES[current_idx + 1]
    db.commit()
    return {"order_id": order.id, "status": order.status}

@app.get("/api/orders")
def all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return [{"id": o.id, "restaurant_name": o.restaurant_name, "total_amount": o.total_amount,
             "status": o.status, "user_id": o.user_id, "created_at": o.created_at} for o in orders]
