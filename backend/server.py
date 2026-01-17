from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import os
import logging
import razorpay
from typing import List, Optional

from models import (
    UserRegister, UserLogin, UserResponse, UserRole, ProviderStatus, BookingStatus,
    ServiceCategoryCreate, ServiceCategoryResponse, ServiceCreate, ServiceResponse,
    BookingCreate, BookingResponse, BookingStatusUpdate, ReviewCreate, ReviewResponse,
    SubscriptionCreate, SubscriptionResponse, PaymentCreate, PaymentResponse, PaymentStatus
)
from auth import (
    get_password_hash, verify_password, create_access_token, 
    get_current_user, require_role
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_1DP5mmOlF5G5ag')
razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'TEST_SECRET')
razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

app = FastAPI(title="Endless Path API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "role": user_data.role,
        "credits": 5,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    if user_data.role == UserRole.PROVIDER:
        provider_profile = {
            "user_id": user_id,
            "service_category": user_data.service_category or "General",
            "experience_years": user_data.experience_years or 0,
            "description": user_data.description or "",
            "status": ProviderStatus.PENDING,
            "rating": 0.0,
            "total_earnings": 0.0,
            "completed_jobs": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.provider_profiles.insert_one(provider_profile)
    
    return UserResponse(
        id=user_id,
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        phone=user_dict["phone"],
        role=user_dict["role"],
        credits=user_dict["credits"],
        is_active=user_dict["is_active"],
        provider_status=ProviderStatus.PENDING if user_data.role == UserRole.PROVIDER else None,
        created_at=user_dict["created_at"]
    )

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    provider_status = None
    if user["role"] == UserRole.PROVIDER:
        provider = await db.provider_profiles.find_one({"user_id": str(user["_id"])})
        provider_status = provider.get("status") if provider else ProviderStatus.PENDING
    
    token_data = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user["phone"],
            "role": user["role"],
            "credits": user.get("credits", 5),
            "provider_status": provider_status
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    provider_status = None
    if user["role"] == UserRole.PROVIDER:
        provider = await db.provider_profiles.find_one({"user_id": str(user["_id"])})
        provider_status = provider.get("status") if provider else None
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        phone=user["phone"],
        role=user["role"],
        credits=user.get("credits", 5),
        is_active=user.get("is_active", True),
        provider_status=provider_status,
        created_at=user["created_at"]
    )

@api_router.post("/categories", response_model=ServiceCategoryResponse)
async def create_category(
    category_data: ServiceCategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    category_dict = {
        **category_data.dict(),
        "service_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.categories.insert_one(category_dict)
    return ServiceCategoryResponse(id=str(result.inserted_id), **category_data.dict())

@api_router.get("/categories", response_model=List[ServiceCategoryResponse])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0, "id": {"$toString": "$_id"}}).to_list(100)
    result = []
    for cat in categories:
        cat_id = cat.get("id")
        service_count = await db.services.count_documents({"category_id": cat_id})
        result.append(ServiceCategoryResponse(
            id=cat_id,
            name=cat["name"],
            description=cat["description"],
            icon=cat.get("icon"),
            service_count=service_count
        ))
    return result

@api_router.post("/services", response_model=ServiceResponse)
async def create_service(
    service_data: ServiceCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Provider access required")
    provider = await db.provider_profiles.find_one({"user_id": current_user["sub"]})
    if not provider or provider.get("status") != ProviderStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Provider not approved yet")
    
    user = await db.users.find_one({"_id": current_user["sub"]})
    category = await db.categories.find_one({"_id": service_data.category_id})
    
    service_dict = {
        **service_data.dict(),
        "provider_id": current_user["sub"],
        "provider_name": user["full_name"],
        "category_name": category["name"] if category else "Unknown",
        "rating": 0.0,
        "reviews_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.services.insert_one(service_dict)
    return ServiceResponse(id=str(result.inserted_id), **service_dict)

@api_router.get("/services", response_model=List[ServiceResponse])
async def get_services(category_id: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    services = await db.services.find(query, {"_id": 0}).to_list(100)
    return [ServiceResponse(id=s.get("id", ""), **s) for s in services]

@api_router.get("/services/provider/me", response_model=List[ServiceResponse])
async def get_my_services(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Provider access required")
    services = await db.services.find({"provider_id": current_user["sub"]}, {"_id": 0}).to_list(100)
    return [ServiceResponse(id=s.get("id", ""), **s) for s in services]

@api_router.post("/bookings", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Customer access required")
    user = await db.users.find_one({"_id": current_user["sub"]})
    
    has_active_subscription = await db.subscriptions.find_one({
        "user_id": current_user["sub"],
        "is_active": True,
        "end_date": {"$gte": datetime.now(timezone.utc).isoformat()}
    })
    
    if not has_active_subscription:
        if user.get("credits", 0) < 1:
            raise HTTPException(status_code=400, detail="Insufficient credits. Please purchase a subscription.")
        await db.users.update_one(
            {"_id": current_user["sub"]},
            {"$inc": {"credits": -1}}
        )
    
    service = await db.services.find_one({"_id": booking_data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    booking_dict = {
        "customer_id": current_user["sub"],
        "customer_name": user["full_name"],
        "service_id": booking_data.service_id,
        "service_title": service["title"],
        "provider_id": service["provider_id"],
        "provider_name": service["provider_name"],
        "status": BookingStatus.PENDING,
        "scheduled_date": booking_data.scheduled_date,
        "notes": booking_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }
    
    result = await db.bookings.insert_one(booking_dict)
    return BookingResponse(id=str(result.inserted_id), **booking_dict)

@api_router.get("/bookings/customer/me", response_model=List[BookingResponse])
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Customer access required")
    bookings = await db.bookings.find({"customer_id": current_user["sub"]}, {"_id": 0}).to_list(100)
    return [BookingResponse(id=b.get("id", ""), **b) for b in bookings]

@api_router.get("/bookings/provider/me", response_model=List[BookingResponse])
async def get_provider_bookings(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != UserRole.PROVIDER:
        raise HTTPException(status_code=403, detail="Provider access required")
    bookings = await db.bookings.find({"provider_id": current_user["sub"]}, {"_id": 0}).to_list(100)
    return [BookingResponse(id=b.get("id", ""), **b) for b in bookings]

@api_router.patch("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status_update: BookingStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    booking = await db.bookings.find_one({"_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if current_user["role"] == UserRole.PROVIDER and booking["provider_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {"status": status_update.status}
    if status_update.status == BookingStatus.COMPLETED:
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        await db.provider_profiles.update_one(
            {"user_id": booking["provider_id"]},
            {"$inc": {"completed_jobs": 1}}
        )
    
    await db.bookings.update_one({"_id": booking_id}, {"$set": update_data})
    return {"status": "updated"}

@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(require_role([UserRole.CUSTOMER]))
):
    booking = await db.bookings.find_one({"_id": review_data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["customer_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if booking["status"] != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
    
    user = await db.users.find_one({"_id": current_user["sub"]})
    
    review_dict = {
        **review_data.dict(),
        "customer_name": user["full_name"],
        "provider_id": booking["provider_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.reviews.insert_one(review_dict)
    
    reviews = await db.reviews.find({"provider_id": booking["provider_id"]}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    
    await db.provider_profiles.update_one(
        {"user_id": booking["provider_id"]},
        {"$set": {"rating": avg_rating}}
    )
    
    await db.services.update_many(
        {"provider_id": booking["provider_id"]},
        {"$set": {"rating": avg_rating, "reviews_count": len(reviews)}}
    )
    
    return ReviewResponse(id=str(result.inserted_id), **review_dict)

@api_router.post("/payments/create-order")
async def create_payment_order(
    payment_data: PaymentCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        order_data = {
            "amount": payment_data.amount,
            "currency": payment_data.currency,
            "payment_capture": 1
        }
        razorpay_order = razorpay_client.order.create(order_data)
        
        payment_dict = {
            "user_id": current_user["sub"],
            "order_id": razorpay_order["id"],
            "amount": payment_data.amount,
            "currency": payment_data.currency,
            "status": PaymentStatus.CREATED,
            "purpose": payment_data.purpose,
            "reference_id": payment_data.reference_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payments.insert_one(payment_dict)
        
        return {
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": razorpay_key_id
        }
    except Exception as e:
        logger.error(f"Payment order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Payment order creation failed")

@api_router.post("/payments/verify")
async def verify_payment(
    payment_id: str,
    order_id: str,
    signature: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_payment_id": payment_id,
            "razorpay_order_id": order_id,
            "razorpay_signature": signature
        })
        
        await db.payments.update_one(
            {"order_id": order_id},
            {"$set": {"status": PaymentStatus.SUCCESS, "payment_id": payment_id}}
        )
        
        return {"status": "success"}
    except Exception as e:
        await db.payments.update_one(
            {"order_id": order_id},
            {"$set": {"status": PaymentStatus.FAILED}}
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    duration_months = 1 if subscription_data.plan_type == "monthly" else 12
    start_date = datetime.now(timezone.utc)
    end_date = start_date + timedelta(days=30 * duration_months)
    
    subscription_dict = {
        "user_id": current_user["sub"],
        "plan_type": subscription_data.plan_type,
        "amount": subscription_data.amount,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "is_active": True,
        "payment_id": payment_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.subscriptions.insert_one(subscription_dict)
    return SubscriptionResponse(id=str(result.inserted_id), **subscription_dict)

@api_router.get("/subscriptions/me")
async def get_my_subscription(current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user["sub"], "is_active": True},
        {"_id": 0}
    )
    if subscription:
        return SubscriptionResponse(id=subscription.get("id", ""), **subscription)
    return None

@api_router.get("/admin/providers", response_model=List[dict])
async def get_pending_providers(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    providers = await db.provider_profiles.find({}, {"_id": 0}).to_list(100)
    result = []
    for provider in providers:
        user = await db.users.find_one({"_id": provider["user_id"]})
        if user:
            result.append({
                **provider,
                "email": user["email"],
                "full_name": user["full_name"],
                "phone": user["phone"]
            })
    return result

@api_router.patch("/admin/providers/{user_id}/status")
async def update_provider_status(
    user_id: str,
    status: str,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    await db.provider_profiles.update_one(
        {"user_id": user_id},
        {"$set": {"status": status}}
    )
    return {"status": "updated"}

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    total_users = await db.users.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_providers = await db.provider_profiles.count_documents({})
    pending_approvals = await db.provider_profiles.count_documents({"status": ProviderStatus.PENDING})
    
    payments = await db.payments.find({"status": PaymentStatus.SUCCESS}).to_list(1000)
    total_revenue = sum(p["amount"] for p in payments) / 100
    
    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_providers": total_providers,
        "pending_approvals": pending_approvals,
        "total_revenue": total_revenue
    }

@api_router.get("/provider/earnings")
async def get_provider_earnings(current_user: dict = Depends(require_role([UserRole.PROVIDER]))):
    provider = await db.provider_profiles.find_one({"user_id": current_user["sub"]})
    completed_bookings = await db.bookings.count_documents({
        "provider_id": current_user["sub"],
        "status": BookingStatus.COMPLETED
    })
    
    reviews = await db.reviews.find({"provider_id": current_user["sub"]}).to_list(100)
    
    return {
        "total_earnings": provider.get("total_earnings", 0),
        "completed_jobs": completed_bookings,
        "rating": provider.get("rating", 0),
        "total_reviews": len(reviews)
    }

@api_router.get("/")
async def root():
    return {"message": "Endless Path API", "status": "running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    admin_exists = await db.users.find_one({"role": UserRole.ADMIN})
    if not admin_exists:
        admin_user = {
            "email": "admin@endlesspath.com",
            "password": get_password_hash("admin123"),
            "full_name": "Admin User",
            "phone": "+919182298869",
            "role": UserRole.ADMIN,
            "credits": 999,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Admin user created")
    
    categories_count = await db.categories.count_documents({})
    if categories_count == 0:
        categories = [
            {"name": "Home Services", "description": "Cleaning, Plumbing, Electrical", "icon": "home"},
            {"name": "Technical Services", "description": "Laptop, Phone, Appliance Repair", "icon": "wrench"},
            {"name": "Transport Services", "description": "Moving, Delivery, Logistics", "icon": "truck"},
            {"name": "Food Services", "description": "Catering, Tiffin, Cooking", "icon": "utensils"},
            {"name": "Emergency Services", "description": "Urgent Repairs, 24/7 Support", "icon": "alert-circle"}
        ]
        for cat in categories:
            cat["service_count"] = 0
            cat["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.categories.insert_many(categories)
        logger.info("Default categories created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
