from datetime import date, datetime


def format_currency(value: float, currency: str = "USD") -> str:
    return f"{value:,.2f} {currency}"


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()
