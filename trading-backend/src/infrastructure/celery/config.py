from celery import Celery

from src.infrastructure.config import settings

celery_app = Celery(
    "infinance",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    "evaluate-alerts-every-60s": {
        "task": "src.infrastructure.celery.tasks.evaluate_alerts_task.evaluate_alerts_task",
        "schedule": 60.0,
    },
}

celery_app.autodiscover_tasks(["src.infrastructure.celery.tasks"])
