class DomainError(Exception):
    """Base exception for business rule violations inside core/."""


class NotFoundError(DomainError):
    """Raised when a requested resource does not exist."""


class UnauthorizedError(DomainError):
    """Raised when a user attempts to access a resource they don't own."""


class ExternalServiceError(DomainError):
    """Raised when an external API (Finnhub, CoinGecko) fails or rate-limits."""
