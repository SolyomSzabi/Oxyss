"""FastAPI application factory. Run with: uvicorn app.main:app"""

import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import appointments, auth, breaks, catalog, misc
from app.core.config import Settings, get_settings
from app.core.database import create_client, ensure_indexes
from app.core.errors import AppError
from app.core.middleware import SecurityHeadersMiddleware

logger = logging.getLogger(__name__)


def create_app(settings: Settings | None = None, *, connect_db: bool = True) -> FastAPI:
    settings = settings or get_settings()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if not connect_db:  # tests attach their own database to app.state.db
            yield
            return
        client = create_client(settings)
        app.state.db = client[settings.db_name]
        await ensure_indexes(app.state.db)
        try:
            yield
        finally:
            await client.close()

    docs_enabled = not settings.is_production
    app = FastAPI(
        title="Oxyss Barbershop API",
        lifespan=lifespan,
        docs_url="/api/docs" if docs_enabled else None,
        redoc_url=None,
        openapi_url="/api/openapi.json" if docs_enabled else None,
    )

    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    api = APIRouter(prefix="/api")
    for module in (misc, auth, catalog, appointments, breaks):
        api.include_router(module.router)
    app.include_router(api)

    app.add_middleware(SecurityHeadersMiddleware, production=settings.is_production)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,  # auth uses bearer tokens, not cookies
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
        max_age=600,
    )
    if not settings.cors_origin_list:
        logger.warning("CORS_ORIGINS is empty: browsers on other origins cannot call this API")
    return app


app = create_app()
