from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import database, models
from ..core.security import get_current_admin_or_operational


router = APIRouter(prefix="/admin/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_admin_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_admin_or_operational),
):
    total_families = db.query(models.Family).count()
    total_children = db.query(models.Child).count()

    attended_children_count = (
        db.query(models.Attendance.child_id)
        .filter(models.Attendance.status == "finalizado")
        .distinct()
        .count()
    )

    total_attendances = db.query(models.Attendance).filter(models.Attendance.status == "finalizado").count()

    severity_query = (
        db.query(models.Child.severity_level, func.count(models.Child.id))
        .group_by(models.Child.severity_level)
        .all()
    )
    children_by_severity = [
        {"label": row[0] or "Não informado", "value": row[1]} for row in severity_query
    ]

    vul_query = (
        db.query(models.Family.vulnerability_status, func.count(models.Family.id))
        .group_by(models.Family.vulnerability_status)
        .all()
    )
    families_by_vulnerability = [
        {"label": row[0] or "Não informado", "value": row[1]} for row in vul_query
    ]

    today = date.today()
    six_months_ago = today - timedelta(days=180)

    db_url = str(db.get_bind().url)
    if "postgresql" in db_url:
        month_func = func.to_char(models.Attendance.end_time, "YYYY-MM")
    else:
        month_func = func.strftime("%Y-%m", models.Attendance.end_time)

    att_query = (
        db.query(month_func.label("month"), func.count(models.Attendance.id))
        .filter(
            models.Attendance.status == "finalizado",
            models.Attendance.end_time >= six_months_ago,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    attendances_by_month = [{"month": row[0], "count": row[1]} for row in att_query]

    return {
        "counts": {
            "families": total_families,
            "children": total_children,
            "attended_children": attended_children_count,
            "total_attendances": total_attendances,
        },
        "charts": {
            "children_severity": children_by_severity,
            "families_vulnerability": families_by_vulnerability,
            "attendances_month": attendances_by_month,
        },
    }
