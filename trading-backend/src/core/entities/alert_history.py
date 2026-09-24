from dataclasses import dataclass
from datetime import datetime


@dataclass
class AlertHistoryEntry:
    id: str
    alert_id: str | None
    asset_id: str | None
    condition: str | None
    is_active: bool | None
    triggered_price: float | None
    message: str
    created_at: datetime
