import sys

from loguru import logger

from src.infrastructure.config import settings

logger.remove()
logger.add(sys.stderr, level=settings.log_level, colorize=True)
logger.add("logs/infinance.log", rotation="10 MB", retention="10 days", level=settings.log_level)

__all__ = ["logger"]
