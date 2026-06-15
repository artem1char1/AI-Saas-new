from fastapi import APIRouter

from app.core.database import check_database_connection

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    db_status = "ok"

    try:
        check_database_connection()
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "service": "ai-saas-api",
        "database": db_status,
    }
