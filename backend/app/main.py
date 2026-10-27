import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import briefs

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(
    title="Brand-Consistent Content Brief Generator API",
    description="Backend API powering AI-driven, evidence-backed, brand-aligned content brief generation.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"},
    )

# Include routes
app.include_router(briefs.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint returning service status, configured model,
    and secret configuration state (never prints secrets).
    """
    has_key = bool(settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here")
    return {
        "status": "healthy",
        "service": "Brand-Consistent Content Brief Generator",
        "version": "1.0.0",
        "gemini_model": settings.gemini_model,
        "api_key_configured": has_key,
        "allowed_origins": settings.cors_origins,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
