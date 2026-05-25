from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from dotenv import load_dotenv
load_dotenv()
from routes.chat import router as chat_router


app.include_router(chat_router)
# ─── APP INIT ───
app = FastAPI(
    title="OrgPilot API",
    description="AI Communication Agent for Organizations",
    version="1.0.0"
)

# ─── CORS ───
# Allows React frontend (localhost:3000) to talk to FastAPI (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev server
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ───
app.include_router(auth_router)

# ─── HEALTH CHECK ───
@app.get("/")
def root():
    return {
        "status": "running",
        "app":    "OrgPilot API",
        "docs":   "http://localhost:8000/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
