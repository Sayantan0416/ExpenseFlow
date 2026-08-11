
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction

from app.routes.transactions import router as transaction_router
from app.routes.users import router as user_router
from app.routes.categories import router as category_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Expense Tracker API",
    description="Backend API for the CODETECH Expense Tracker Dashboard",
    version="1.0.0"
)


# ==============================
# CORS CONFIGURATION
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# API ROUTES
# ==============================

app.include_router(transaction_router)
app.include_router(user_router)
app.include_router(category_router)


# ==============================
# ROOT ENDPOINT
# ==============================

@app.get("/")
def root():
    return {
        "message": "Expense Tracker API is running",
        "status": "success"
    }


# ==============================
# HEALTH CHECK
# ==============================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }

