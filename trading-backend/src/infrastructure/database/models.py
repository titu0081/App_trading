"""SQLAlchemy ORM models mirroring the InFinance PostgreSQL schema (see docs/).

auth.users is managed natively by Supabase Auth and is intentionally NOT
modeled here; user_id columns store the UUID without a local ORM relationship.
"""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, Text, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class AssetType(str, enum.Enum):
    stock = "stock"
    crypto = "crypto"
    forex = "forex"
    index = "index"


class ApiSource(str, enum.Enum):
    finnhub = "finnhub"
    coingecko = "coingecko"
    alphavantage = "alphavantage"
    twelvedata = "twelvedata"


class AlertType(str, enum.Enum):
    price_target = "price_target"
    percent_variation = "percent_variation"
    indicator = "indicator"
    dividend = "dividend"


class AlertCondition(str, enum.Enum):
    above = "above"
    below = "below"
    crosses_up = "crosses_up"
    crosses_down = "crosses_down"


class ErrorLevel(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class FinancialAssetModel(Base):
    __tablename__ = "financial_assets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[AssetType] = mapped_column(SAEnum(AssetType, name="asset_type"), nullable=False)
    source_api: Mapped[ApiSource] = mapped_column(SAEnum(ApiSource, name="api_source"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserProfileModel(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    full_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserWatchlistModel(Base):
    __tablename__ = "user_watchlists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    assets: Mapped[list["WatchlistAssetModel"]] = relationship(
        back_populates="watchlist", cascade="all, delete-orphan"
    )


class WatchlistAssetModel(Base):
    __tablename__ = "watchlist_assets"
    __table_args__ = (UniqueConstraint("watchlist_id", "asset_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    watchlist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_watchlists.id", ondelete="CASCADE"), nullable=False
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("financial_assets.id", ondelete="CASCADE"), nullable=False
    )
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    watchlist: Mapped["UserWatchlistModel"] = relationship(back_populates="assets")
    asset: Mapped["FinancialAssetModel"] = relationship()


class AssetPriceModel(Base):
    __tablename__ = "asset_prices"
    __table_args__ = (UniqueConstraint("asset_id", "timestamp", "source_api"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("financial_assets.id", ondelete="CASCADE"), nullable=False
    )
    price: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    volume: Mapped[float | None] = mapped_column(Numeric(20, 2), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_api: Mapped[ApiSource] = mapped_column(SAEnum(ApiSource, name="api_source"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AssetDividendModel(Base):
    __tablename__ = "asset_dividends"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("financial_assets.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False)
    yield_: Mapped[float | None] = mapped_column("yield", Numeric(5, 2), nullable=True)
    pay_date: Mapped[date] = mapped_column(Date, nullable=False)
    ex_dividend_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserAlertModel(Base):
    __tablename__ = "user_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("financial_assets.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[AlertType] = mapped_column(SAEnum(AlertType, name="alert_type"), nullable=False)
    condition: Mapped[AlertCondition | None] = mapped_column(
        SAEnum(AlertCondition, name="alert_condition"), nullable=True
    )
    target_value: Mapped[float | None] = mapped_column(Numeric(15, 4), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AlertHistoryModel(Base):
    __tablename__ = "alert_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    alert_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_alerts.id", ondelete="SET NULL"), nullable=True
    )
    triggered_price: Mapped[float | None] = mapped_column(Numeric(15, 4), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserNotificationModel(Base):
    __tablename__ = "user_notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    alert_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_alerts.id", ondelete="CASCADE"), nullable=True
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SystemErrorLogModel(Base):
    __tablename__ = "system_error_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level: Mapped[ErrorLevel] = mapped_column(SAEnum(ErrorLevel, name="error_level"), nullable=False)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    stack_trace: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
