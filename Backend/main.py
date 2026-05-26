from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import connect_db, close_db

load_dotenv()

from routes.auth      import router as auth_router
from routes.chat      import router as chat_router
from routes.ai        import router as ai_router
from routes.email     import router as email_router
from routes.employees import router as employees_router
from routes.scheduler import router as meetings_router
app = FastAPI(
    title="OrgPilot API",
    description="AI Communication Agent for Organizations",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,      prefix="/api")
app.include_router(chat_router,      prefix="/api")
app.include_router(ai_router,        prefix="/api")
app.include_router(email_router,     prefix="/api")
app.include_router(employees_router, prefix="/api")
app.include_router(meetings_router,  prefix="/api")

@app.get("/")
def root():
    return {"status": "running", "app": "OrgPilot API", "docs": "http://localhost:8000/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}