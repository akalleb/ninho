from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from .core.limiter import limiter
from .routers import reports, attendances, inventory, health_referrals, evolutions, notifications, admin_dashboard
from .modules.families.router import router as families_router
from .modules.children.router import router as children_router
from .modules.finances.router import router as finances_router
from .modules.projects.router import router as projects_router
from .modules.professionals.router import router as professionals_router
from .modules.auth.router import router as auth_router
import os
import time
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ninho_api")



app = FastAPI(title="Sistema Ninho API")
app.state.limiter = limiter
try:
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware

    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
except Exception:
    pass

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    logger.info(f"{request_id} {request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    return response


@app.exception_handler(IntegrityError)
async def handle_integrity_error(request: Request, exc: IntegrityError):
    logger.exception("Erro de integridade no banco")
    return JSONResponse(status_code=400, content={"detail": "Erro de integridade no banco de dados"})


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception("Erro inesperado")
    return JSONResponse(status_code=500, content={"detail": "Erro interno"})


@app.on_event("startup")
async def validate_runtime_settings():
    env = (os.getenv("ENVIRONMENT") or os.getenv("ENV") or os.getenv("NODE_ENV") or "").strip().lower()
    is_production = env in {"prod", "production"}
    if not is_production:
        return

    if not os.getenv("DATABASE_URL"):
        raise RuntimeError("DATABASE_URL não configurado")
    if not os.getenv("SECRET_KEY"):
        raise RuntimeError("SECRET_KEY não configurado")
    if not os.getenv("ENCRYPTION_KEY"):
        raise RuntimeError("ENCRYPTION_KEY não configurado")


@app.on_event("startup")
async def ensure_sqlite_schema():
    env = (os.getenv("ENVIRONMENT") or os.getenv("ENV") or os.getenv("NODE_ENV") or "").strip().lower()
    is_production = env in {"prod", "production"}
    db_url = (os.getenv("DATABASE_URL") or "").strip().lower()
    if is_production or not db_url.startswith("sqlite"):
        return

    from sqlalchemy import inspect
    from .database import engine, Base
    from . import models as _app_models
    from .modules.children import models as _children_models
    from .modules.families import models as _families_models
    from .modules.finances import models as _finances_models
    from .modules.projects import models as _projects_models
    from .modules.professionals import models as _professionals_models

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    if "professionals" in existing_tables:
        return

    Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(professionals_router)
app.include_router(families_router)
app.include_router(children_router)
app.include_router(projects_router)
app.include_router(finances_router)
app.include_router(reports.router)
app.include_router(attendances.router)
app.include_router(inventory.router)
app.include_router(health_referrals.router)
app.include_router(evolutions.router)
app.include_router(admin_dashboard.router)
app.include_router(notifications.router)

origins = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

allowed_hosts = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h.strip()]
enable_trusted_host = os.getenv("ENABLE_TRUSTED_HOST", "").strip().lower() in {"1", "true", "yes"}
if enable_trusted_host and allowed_hosts and "*" not in allowed_hosts:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed_hosts,
    )

origins = [o.strip() for o in origins if o and o.strip() and o.strip() != "*"]
if not origins:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

env = (os.getenv("ENVIRONMENT") or os.getenv("ENV") or os.getenv("NODE_ENV") or "").strip().lower()
is_production = env in {"prod", "production"}
allow_origin_regex = None if is_production else r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded media
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), "media")
AVATAR_DIR = os.path.join(MEDIA_ROOT, "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Sistema Ninho API"}
