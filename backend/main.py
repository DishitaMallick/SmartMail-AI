from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env specifically
_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))

from backend.routes.auth import router as auth_router
from backend.routes.gmail import router as gmail_router
from backend.routes.emails import router as emails_router
from backend.routes.categories import router as categories_router
from backend.routes.organization import router as org_router
from backend.routes.settings import router as settings_router

app = FastAPI(
    title="SmartMail AI API",
    description="Intelligent AI-powered Gmail Organization and Productivity Backend",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router)
app.include_router(gmail_router)
app.include_router(emails_router)
app.include_router(categories_router)
app.include_router(org_router)
app.include_router(settings_router)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Returns a friendly message instead of a raw stack trace to the client."""
    print(f"[SmartMail AI] Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "code": "server_error",
                "message": "SmartMail AI ran into a problem. Please try again in a moment.",
            }
        },
    )


@app.get("/")
def root():
    return {
        "product": "SmartMail AI",
        "tagline": "Your inbox, intelligently organized.",
        "status": "online",
        "version": "1.0.0",
        "gmail_configured": bool(
            os.getenv("GOOGLE_CLIENT_ID", "").strip()
            and os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
        ),
        "docs_url": "/docs",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SmartMail AI Backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
