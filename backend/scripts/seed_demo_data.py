"""
Populate the database with demo contacts, deals, and activities.

Usage (from backend/):
    .venv\\Scripts\\python scripts/seed_demo_data.py
    .venv\\Scripts\\python scripts/seed_demo_data.py --force   # re-seed even if marker exists
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import delete, select

from app.core.database import SessionLocal
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization_member import OrganizationMember

SEED_MARKER_EMAIL = "seed-marker@demo.local"
UTC = timezone.utc


def _now() -> datetime:
    return datetime.now(UTC)


def _days_ago(days: int, hour: int = 10) -> datetime:
    return (_now() - timedelta(days=days)).replace(hour=hour, minute=0, second=0, microsecond=0)


def _days_ahead(days: int, hour: int = 11) -> datetime:
    return (_now() + timedelta(days=days)).replace(hour=hour, minute=0, second=0, microsecond=0)


CONTACTS_DATA = [
    {
        "name": "Алексей Петров",
        "email": "aleksey.petrov@techline.ru",
        "phone": "+7 (495) 123-45-67",
        "company_name": "ТехЛайн",
        "position": "Директор по закупкам",
    },
    {
        "name": "Мария Соколова",
        "email": "m.sokolova@greenfield.io",
        "phone": "+7 (812) 987-65-43",
        "company_name": "GreenField",
        "position": "Head of Operations",
    },
    {
        "name": "Дмитрий Козлов",
        "email": "d.kozlov@logist-pro.ru",
        "phone": "+7 (903) 555-12-34",
        "company_name": "ЛогистПро",
        "position": "Коммерческий директор",
    },
    {
        "name": "Елена Волкова",
        "email": "e.volkova@retailmax.com",
        "phone": "+7 (916) 444-88-99",
        "company_name": "RetailMax",
        "position": "CFO",
    },
    {
        "name": "Игорь Новиков",
        "email": "i.novikov@startup-hub.dev",
        "phone": "+7 (926) 111-22-33",
        "company_name": "Startup Hub",
        "position": "CEO",
    },
    {
        "name": "Ольга Морозова",
        "email": "o.morozova@finserve.ru",
        "phone": "+7 (495) 777-00-11",
        "company_name": "FinServe",
        "position": "Руководитель IT",
    },
    {
        "name": "Сергей Лебедев",
        "email": "s.lebedev@stroydom.group",
        "phone": "+7 (843) 333-44-55",
        "company_name": "СтройДом",
        "position": "Главный инженер",
    },
    {
        "name": "Анна Кузнецова",
        "email": "a.kuznetsova@medplus.clinic",
        "phone": "+7 (499) 222-33-44",
        "company_name": "МедПлюс",
        "position": "Администратор",
    },
    {
        "name": "Павел Орлов",
        "email": "p.orlov@agro-union.ru",
        "phone": "+7 (905) 666-77-88",
        "company_name": "АгроСоюз",
        "position": "Директор филиала",
    },
    {
        "name": "Seed Marker",
        "email": SEED_MARKER_EMAIL,
        "phone": None,
        "company_name": "Demo",
        "position": None,
    },
]


SEED_EMAILS = frozenset(c["email"] for c in CONTACTS_DATA if c.get("email"))


def build_deals() -> list[dict]:
    today = _now().date()
    return [
        {
            "contact_idx": 0,
            "title": "Внедрение CRM — ТехЛайн",
            "amount": Decimal("850000"),
            "status": "negotiation",
            "priority": "high",
            "expected_close_date": today + timedelta(days=12),
            "last_contact_at": _days_ago(2, 14),
            "next_action": "Согласовать финальное КП с юридическим отделом",
            "next_action_at": _days_ahead(1, 10),
        },
        {
            "contact_idx": 1,
            "title": "Подписка Enterprise — GreenField",
            "amount": Decimal("1200000"),
            "status": "proposal",
            "priority": "high",
            "expected_close_date": today + timedelta(days=25),
            "last_contact_at": _days_ago(5),
            "next_action": "Презентация для совета директоров",
            "next_action_at": _days_ahead(3, 15),
        },
        {
            "contact_idx": 2,
            "title": "Интеграция с 1С — ЛогистПро",
            "amount": Decimal("450000"),
            "status": "qualification",
            "priority": "medium",
            "expected_close_date": today + timedelta(days=40),
            "last_contact_at": _days_ago(7),
            "next_action": "Созвон с IT-отделом, уточнить API",
            "next_action_at": _days_ahead(2, 11),
        },
        {
            "contact_idx": 3,
            "title": "Пилот на 3 месяца — RetailMax",
            "amount": Decimal("320000"),
            "status": "new",
            "priority": "medium",
            "expected_close_date": today + timedelta(days=60),
            "last_contact_at": _days_ago(14),
            "next_action": "Отправить кейсы из ритейла",
            "next_action_at": _days_ahead(4),
        },
        {
            "contact_idx": 4,
            "title": "Стартовый пакет — Startup Hub",
            "amount": Decimal("150000"),
            "status": "won",
            "priority": "low",
            "expected_close_date": today - timedelta(days=5),
            "last_contact_at": _days_ago(3),
            "next_action": None,
            "next_action_at": None,
        },
        {
            "contact_idx": 5,
            "title": "Миграция данных — FinServe",
            "amount": Decimal("980000"),
            "status": "negotiation",
            "priority": "high",
            "expected_close_date": today + timedelta(days=8),
            "last_contact_at": _days_ago(1, 16),
            "next_action": "Подписать NDA и получить доступ к тестовой среде",
            "next_action_at": _days_ahead(0, 9),
        },
        {
            "contact_idx": 6,
            "title": "Лицензии на 50 пользователей — СтройДом",
            "amount": Decimal("600000"),
            "status": "lost",
            "priority": "medium",
            "expected_close_date": today - timedelta(days=20),
            "last_contact_at": _days_ago(25),
            "next_action": None,
            "next_action_at": None,
            "loss_reason": "Выбрали конкурента из-за более низкой цены",
        },
        {
            "contact_idx": 7,
            "title": "Обучение персонала — МедПлюс",
            "amount": Decimal("180000"),
            "status": "proposal",
            "priority": "low",
            "expected_close_date": today + timedelta(days=18),
            "last_contact_at": _days_ago(4),
            "next_action": "Прислать программу обучения и расписание",
            "next_action_at": _days_ahead(2, 14),
        },
        {
            "contact_idx": 8,
            "title": "Сезонный контракт — АгроСоюз",
            "amount": Decimal("275000"),
            "status": "qualification",
            "priority": "low",
            "expected_close_date": today + timedelta(days=45),
            "last_contact_at": _days_ago(10),
            "next_action": "Выезд на объект, сбор требований",
            "next_action_at": _days_ahead(5, 10),
        },
        {
            "contact_idx": 0,
            "title": "Доп. модули аналитики — ТехЛайн",
            "amount": Decimal("220000"),
            "status": "new",
            "priority": "medium",
            "expected_close_date": today + timedelta(days=90),
            "last_contact_at": _days_ago(20),
            "next_action": "Уточнить список отчётов",
            "next_action_at": _days_ahead(7),
        },
        {
            "contact_idx": 1,
            "title": "Расширение лицензий — GreenField",
            "amount": Decimal("340000"),
            "status": "won",
            "priority": "medium",
            "expected_close_date": today - timedelta(days=12),
            "last_contact_at": _days_ago(8),
            "next_action": None,
            "next_action_at": None,
        },
        {
            "contact_idx": 5,
            "title": "Аудит безопасности — FinServe",
            "amount": Decimal("410000"),
            "status": "proposal",
            "priority": "high",
            "expected_close_date": today - timedelta(days=3),
            "last_contact_at": _days_ago(6),
            "next_action": "Перезвонить — просрочен дедлайн по КП",
            "next_action_at": _days_ago(1, 10),
        },
    ]


ACTIVITIES_TEMPLATE = [
    ("call", "Первичный звонок, выявили потребность в автоматизации продаж."),
    ("email", "Отправили презентацию продукта и прайс-лист."),
    ("meeting", "Встреча в офисе клиента, обсудили сроки внедрения."),
    ("call", "Уточнили бюджет и лицо, принимающее решение."),
    ("note", "Клиент запросил референсы из смежной отрасли."),
    ("email", "Прислали кейс-стади и отзывы."),
    ("meeting", "Демо продукта для команды из 5 человек."),
    ("call", "Согласовали следующий шаг — подготовка КП."),
    ("note", "Конкурент также в переговорах, нужно ускориться."),
    ("call", "Обсудили скидку при годовой оплате."),
]


def _cleanup_previous_seed(db, org_id) -> None:
    contacts = db.scalars(
        select(Contact).where(
            Contact.organization_id == org_id,
            Contact.email.in_(SEED_EMAILS),
        )
    ).all()
    if not contacts:
        return
    contact_ids = [c.id for c in contacts]
    deals = db.scalars(select(Deal).where(Deal.contact_id.in_(contact_ids))).all()
    deal_ids = [d.id for d in deals]
    if deal_ids:
        db.execute(delete(Activity).where(Activity.deal_id.in_(deal_ids)))
        db.execute(delete(Deal).where(Deal.id.in_(deal_ids)))
    db.execute(delete(Contact).where(Contact.id.in_(contact_ids)))
    db.flush()


def seed(force: bool = False) -> None:
    db = SessionLocal()
    try:
        member = db.scalar(
            select(OrganizationMember)
            .where(OrganizationMember.is_active.is_(True))
            .order_by(OrganizationMember.created_at)
        )
        if member is None:
            print("Организация не найдена. Сначала зарегистрируйтесь и создайте организацию.")
            sys.exit(1)

        org_id = member.organization_id
        user_id = member.user_id

        marker = db.scalar(
            select(Contact).where(
                Contact.organization_id == org_id,
                Contact.email == SEED_MARKER_EMAIL,
            )
        )
        if marker and not force:
            print("Демо-данные уже загружены. Используйте --force для повторной загрузки.")
            return

        if force:
            _cleanup_previous_seed(db, org_id)

        contacts: list[Contact] = []
        for data in CONTACTS_DATA:
            contact = Contact(organization_id=org_id, **data)
            db.add(contact)
            contacts.append(contact)
        db.flush()

        deals: list[Deal] = []
        for spec in build_deals():
            contact = contacts[spec["contact_idx"]]
            deal = Deal(
                organization_id=org_id,
                contact_id=contact.id,
                title=spec["title"],
                amount=spec["amount"],
                currency="RUB",
                status=spec["status"],
                priority=spec["priority"],
                expected_close_date=spec["expected_close_date"],
                last_contact_at=spec.get("last_contact_at"),
                next_action=spec.get("next_action"),
                next_action_at=spec.get("next_action_at"),
                loss_reason=spec.get("loss_reason"),
            )
            db.add(deal)
            deals.append(deal)
        db.flush()

        activity_count = 0
        for deal_idx, deal in enumerate(deals):
            num_activities = 2 + (deal_idx % 3)
            for act_idx in range(num_activities):
                tpl_idx = (deal_idx + act_idx) % len(ACTIVITIES_TEMPLATE)
                act_type, content = ACTIVITIES_TEMPLATE[tpl_idx]
                happened = _days_ago(30 - deal_idx * 2 - act_idx * 3, 9 + act_idx)
                activity = Activity(
                    organization_id=org_id,
                    deal_id=deal.id,
                    contact_id=deal.contact_id,
                    user_id=user_id,
                    type=act_type,
                    content=content,
                    happened_at=happened,
                )
                db.add(activity)
                activity_count += 1

                if deal.last_contact_at is None or happened > deal.last_contact_at:
                    deal.last_contact_at = happened

        db.commit()
        print(
            f"Готово: {len(contacts)} контактов, {len(deals)} сделок, "
            f"{activity_count} активностей (org={org_id})."
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed demo CRM data")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Add demo data even if seed marker contact already exists",
    )
    args = parser.parse_args()
    seed(force=args.force)


if __name__ == "__main__":
    main()
