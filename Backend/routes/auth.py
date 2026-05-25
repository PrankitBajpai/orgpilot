from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import jwt
import os
from datetime import datetime, timedelta

# ─── CONFIG ───
SECRET     = os.getenv("JWT_SECRET", "orgpilot_secret_change_in_prod")
ALGORITHM  = "HS256"
EXPIRE_HRS = 24
MONGO_URL  = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# ─── DB ───
client           = AsyncIOMotorClient(MONGO_URL)
db               = client["orgpilot"]
users_collection = db["users"]

# ─── PASSWORD HASHING ───
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── ROUTER ───
router = APIRouter(prefix="/api", tags=["auth"])

# ─── MODELS ───
class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

# ─── HELPER: create JWT ───
def create_token(email: str, name: str) -> str:
    payload = {
        "email": email,
        "name":  name,
        "exp":   datetime.utcnow() + timedelta(hours=EXPIRE_HRS)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

# ════════════════════════════════
#  REGISTER
# ════════════════════════════════
@router.post("/register")
async def register(req: RegisterRequest):

    # 1. Sanitize inputs
    clean_email = str(req.email).lower().strip()
    clean_name  = str(req.name).strip()

    # 2. Validate
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # 3. Check duplicate email in MongoDB
    existing = await users_collection.find_one({"email": clean_email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # 4. Hash password — NEVER store plain text
    hashed = pwd.hash(req.password)

    # 5. Save to MongoDB
    try:
        await users_collection.insert_one({
            "name":       clean_name,
            "email":      clean_email,   # pure string → saves perfectly into BSON
            "password":   hashed,
            "created_at": datetime.utcnow().isoformat(),
            "role":       "admin"
        })
    except Exception as e:
        print(f"DB INSERT ERROR: {e}")
        raise HTTPException(status_code=500, detail="Database error")

    # 6. Auto-login after register — return token immediately
    token = create_token(clean_email, clean_name)
    return {
        "message": "Account created successfully",
        "token":   token,
        "name":    clean_name,
        "email":   clean_email
    }

# ════════════════════════════════
#  LOGIN
# ════════════════════════════════
@router.post("/login")
async def login(req: LoginRequest):

    clean_email = str(req.email).lower().strip()

    # 1. Find user in MongoDB
    user = await users_collection.find_one({"email": clean_email})

    # 2. Verify — same error for both cases (security best practice)
    if not user or not pwd.verify(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 3. Return JWT token
    token = create_token(clean_email, user.get("name", "User"))
    return {
        "token": token,
        "name":  user.get("name", "User"),
        "email": clean_email,
        "role":  user.get("role", "admin")
    }

# ════════════════════════════════
#  LOGOUT  (stateless — client deletes token)
# ════════════════════════════════
@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}