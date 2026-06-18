from datetime import date, datetime, timezone
from decimal import Decimal

from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal

OUTCOME_STATUSES = frozenset({"won", "lost"})


def _format_value(value: str | None, fallback: str = "—") -> str:
    if value is None or not str(value).strip():
        return fallback
    return str(value).strip()


def _format_date(value: date | datetime | None) -> str:
    if value is None:
        return "—"
    if isinstance(value, datetime):
        return value.strftime("%d.%m.%Y %H:%M")
    return value.strftime("%d.%m.%Y")


def _format_amount(amount: Decimal | None) -> str:
    if amount is None:
        return "—"
    return f"{amount:,.0f}".replace(",", " ")


def _format_yes_no(value: bool) -> str:
    return "да" if value else "нет"


def _to_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _resolve_last_contact_at(deal: Deal, activities: list[Activity]) -> datetime | None:
    timestamps: list[datetime] = []

    if deal.last_contact_at is not None:
        timestamps.append(_to_utc(deal.last_contact_at))

    for activity in activities:
        timestamps.append(_to_utc(activity.happened_at))

    if not timestamps:
        return None

    return max(timestamps)


def _format_days_since_last_contact(last_contact_at: datetime | None, now: datetime) -> str:
    if last_contact_at is None:
        return "нет данных"

    days = (now.date() - _to_utc(last_contact_at).date()).days
    if days <= 0:
        return "сегодня"
    if days == 1:
        return "1 день назад"
    if 2 <= days <= 4:
        return f"{days} дня назад"
    return f"{days} дней назад"


def _is_next_action_overdue(deal: Deal, now: datetime) -> bool:
    if deal.next_action_at is None or deal.status in OUTCOME_STATUSES:
        return False
    return _to_utc(deal.next_action_at) < now


def _is_close_date_overdue(deal: Deal, today: date) -> bool:
    if deal.expected_close_date is None or deal.status in OUTCOME_STATUSES:
        return False
    return deal.expected_close_date < today


def _format_activities(activities: list[Activity]) -> str:
    if not activities:
        return "— (истории общения пока нет — не ссылайся на прошлые разговоры)"

    lines: list[str] = []
    for activity in activities:
        happened = activity.happened_at.strftime("%d.%m.%Y %H:%M")
        content = _format_value(activity.content, "без описания")
        lines.append(f"- [{happened}] {activity.type}: {content}")
    return "\n".join(lines)


def build_followup_prompt(*, deal: Deal, contact: Contact, activities: list[Activity]) -> str:
    now = _now_utc()
    last_contact_at = _resolve_last_contact_at(deal, activities)
    days_since_contact = _format_days_since_last_contact(last_contact_at, now)
    next_action_overdue = _is_next_action_overdue(deal, now)
    close_date_overdue = _is_close_date_overdue(deal, now.date())

    return f"""Сгенерируй follow-up сообщение клиенту на русском языке.

Контекст:

Контакт:
- Имя: {_format_value(contact.name)}
- Компания: {_format_value(contact.company_name)}
- Должность: {_format_value(contact.position)}
- Email: {_format_value(contact.email)}

Сделка:
- Название: {_format_value(deal.title)}
- Сумма: {_format_amount(deal.amount)} ₽
- Статус: {_format_value(deal.status)}
- Приоритет: {_format_value(deal.priority)}
- Следующий шаг: {_format_value(deal.next_action)}
- Дата следующего шага: {_format_date(deal.next_action_at)}
- Ожидаемая дата закрытия: {_format_date(deal.expected_close_date)}

Сигналы по срокам:
- Последний контакт: {days_since_contact}
- Следующий шаг просрочен: {_format_yes_no(next_action_overdue)}
- Дата закрытия просрочена: {_format_yes_no(close_date_overdue)}

Последние активности (используй только эти факты, не выдумывай другие):
{_format_activities(activities)}

Как использовать контекст:
- Опирайся на конкретные факты из истории общения и полей сделки.
- Если клиент задавал вопрос или запрашивал материалы — обязательно упомяни это.
- Если следующий шаг просрочен — корректно и тактично напомни о нём.
- Если дата закрытия просрочена — мягко уточни актуальность сроков, без давления.
- Сообщение должно выглядеть как продолжение реального диалога, а не как шаблонная рассылка.

Избегай шаблонных фраз:
- надеюсь, у вас всё хорошо
- надеемся на сотрудничество
- будем рады помочь
- если возникнут вопросы

Используй только факты из контекста.

Сформируй сообщение по схеме:
1. Краткое приветствие.
2. Ссылка на последнее обсуждение (конкретная деталь из активностей).
3. Напоминание о текущем статусе сделки (если уместно).
4. Следующее действие (что предлагаем сделать дальше).
5. Вопрос клиенту.

Требования к ответу:
- не выдумывай факты, которых нет в контексте
- пиши деловым, но дружелюбным стилем
- максимум 1200 символов
- добавь понятный call-to-action
- не используй markdown
- не добавляй тему письма
- не нумеруй пункты в финальном тексте
- верни только текст сообщения"""
