from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"

class BookingStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class ProviderStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    BLOCKED = "blocked"

class PaymentStatus(str, Enum):
    CREATED = "created"
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    role: UserRole
    service_category: Optional[str] = None
    experience_years: Optional[int] = None
    description: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str
    role: UserRole
    credits: int = 5
    is_active: bool = True
    provider_status: Optional[str] = None
    created_at: str

class ServiceCategoryCreate(BaseModel):
    name: str
    description: str
    icon: Optional[str] = None

class ServiceCategoryResponse(BaseModel):
    id: str
    name: str
    description: str
    icon: Optional[str] = None
    service_count: int = 0

class ServiceCreate(BaseModel):
    title: str
    description: str
    category_id: str
    price: float
    duration_minutes: int
    location: str

class ServiceResponse(BaseModel):
    id: str
    provider_id: str
    provider_name: str
    title: str
    description: str
    category_id: str
    category_name: str
    price: float
    duration_minutes: int
    location: str
    rating: float = 0.0
    reviews_count: int = 0
    created_at: str

class BookingCreate(BaseModel):
    service_id: str
    scheduled_date: str
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    service_id: str
    service_title: str
    provider_id: str
    provider_name: str
    status: BookingStatus
    scheduled_date: str
    notes: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: BookingStatus

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: str
    booking_id: str
    customer_name: str
    provider_id: str
    rating: int
    comment: Optional[str] = None
    created_at: str

class SubscriptionCreate(BaseModel):
    plan_type: str
    amount: float

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan_type: str
    amount: float
    start_date: str
    end_date: str
    is_active: bool
    payment_id: Optional[str] = None

class PaymentCreate(BaseModel):
    amount: int
    currency: str = "INR"
    purpose: str
    reference_id: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    order_id: str
    amount: int
    currency: str
    status: PaymentStatus
    purpose: str
    reference_id: Optional[str] = None
    created_at: str
