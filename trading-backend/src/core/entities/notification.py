from dataclasses import dataclass
from datetime import datetime


@dataclass
class Notification:
    """Pure domain representation of a user_notifications row."""

    id: str | None
    user_id: str
    alert_id: str | None
    message: str
    is_read: bool = False
    created_at: datetime | None = None
