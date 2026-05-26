import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

# ─── CONFIG ───
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "orgpilot")

# ─── CLIENT ───
client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

# ─── COLLECTIONS ───
users_collection         = db["users"]
employees_collection     = db["employees"]
emails_collection        = db["sent_emails"]
meetings_collection      = db["meetings"]
announcements_collection = db["announcements"]
chat_collection          = db["chats"]

# ─── STARTUP: test connection ───
async def connect_db():
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

# ─── SHUTDOWN: close connection ───
async def close_db():
    client.close()
    print("🔌 MongoDB connection closed")