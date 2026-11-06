"""
Seed the database with demo data.
Run from the api/ directory:
    python -m scripts.seed
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, timedelta, timezone, datetime
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import get_settings
from app.core.security import hash_password
from app.models import (
    User, UserRole,
    Project, ProjectStatus, ProjectType,
    Preset, PresetKind,
)

settings = get_settings()


STYLE_PRESETS = [
    {
        "name": "Modern & Clean",
        "sort_order": 0,
        "data": {
            "description": "Crisp, airy layouts with generous white space and sharp typography.",
            "thumbnail_color": "#2563EB",
            "colors": {"primary": "#2563EB", "secondary": "#7C3AED", "neutral": "#6B7280", "background": "#FFFFFF"},
            "fonts": {"heading": "Inter", "body": "Inter", "scale_ratio": 1.25},
            "shape": {"radius": "soft", "density": "comfortable", "shadow": "subtle", "button_style": "filled"},
            "voice": {"tone": "friendly"},
        },
    },
    {
        "name": "Premium & Elegant",
        "sort_order": 1,
        "data": {
            "description": "Refined serif headings, deep purples, and luxurious spacing.",
            "thumbnail_color": "#6D28D9",
            "colors": {"primary": "#6D28D9", "secondary": "#B45309", "neutral": "#4B5563", "background": "#FAFAF9"},
            "fonts": {"heading": "Playfair Display", "body": "Lato", "scale_ratio": 1.333},
            "shape": {"radius": "sharp", "density": "airy", "shadow": "subtle", "button_style": "outline"},
            "voice": {"tone": "formal"},
        },
    },
    {
        "name": "Bold & Playful",
        "sort_order": 2,
        "data": {
            "description": "Vivid colors, rounded corners, and an energetic voice.",
            "thumbnail_color": "#EA580C",
            "colors": {"primary": "#EA580C", "secondary": "#7C3AED", "neutral": "#6B7280", "background": "#FFFFFF"},
            "fonts": {"heading": "Nunito", "body": "Nunito", "scale_ratio": 1.25},
            "shape": {"radius": "pill", "density": "comfortable", "shadow": "medium", "button_style": "filled"},
            "voice": {"tone": "playful"},
        },
    },
    {
        "name": "Warm & Friendly",
        "sort_order": 3,
        "data": {
            "description": "Earthy tones, soft corners, and an approachable personality.",
            "thumbnail_color": "#D97706",
            "colors": {"primary": "#D97706", "secondary": "#059669", "neutral": "#78716C", "background": "#FFFBF5"},
            "fonts": {"heading": "Plus Jakarta Sans", "body": "Source Sans 3", "scale_ratio": 1.2},
            "shape": {"radius": "rounded", "density": "comfortable", "shadow": "subtle", "button_style": "soft"},
            "voice": {"tone": "friendly"},
        },
    },
    {
        "name": "Tech & Minimal",
        "sort_order": 4,
        "data": {
            "description": "Monospace accents, tight grids, and a confident technical tone.",
            "thumbnail_color": "#111827",
            "colors": {"primary": "#111827", "secondary": "#2563EB", "neutral": "#6B7280", "background": "#F9FAFB"},
            "fonts": {"heading": "Space Grotesk", "body": "Inter", "scale_ratio": 1.25},
            "shape": {"radius": "sharp", "density": "compact", "shadow": "none", "button_style": "outline"},
            "voice": {"tone": "formal"},
        },
    },
    {
        "name": "Natural & Calm",
        "sort_order": 5,
        "data": {
            "description": "Forest greens, organic shapes, and a serene editorial feel.",
            "thumbnail_color": "#16A34A",
            "colors": {"primary": "#16A34A", "secondary": "#0D9488", "neutral": "#6B7280", "background": "#F7FEF9"},
            "fonts": {"heading": "Merriweather", "body": "Source Sans 3", "scale_ratio": 1.333},
            "shape": {"radius": "soft", "density": "airy", "shadow": "subtle", "button_style": "soft"},
            "voice": {"tone": "friendly"},
        },
    },
]

FONT_PRESETS = [
    {"name": "Inter / Inter", "data": {"heading": "Inter", "body": "Inter"}, "sort_order": 0},
    {"name": "Playfair Display / Lato", "data": {"heading": "Playfair Display", "body": "Lato"}, "sort_order": 1},
    {"name": "Nunito / Nunito", "data": {"heading": "Nunito", "body": "Nunito"}, "sort_order": 2},
    {"name": "Plus Jakarta Sans / Open Sans", "data": {"heading": "Plus Jakarta Sans", "body": "Open Sans"}, "sort_order": 3},
    {"name": "Space Grotesk / Inter", "data": {"heading": "Space Grotesk", "body": "Inter"}, "sort_order": 4},
    {"name": "Merriweather / Source Sans 3", "data": {"heading": "Merriweather", "body": "Source Sans 3"}, "sort_order": 5},
]

KHMER_FONT_PRESETS = [
    {"name": "Kantumruy Pro", "data": {"heading": "Kantumruy Pro", "body": "Kantumruy Pro", "description": "Modern Khmer sans-serif. Excellent readability."}, "sort_order": 0},
    {"name": "Noto Sans Khmer", "data": {"heading": "Noto Sans Khmer", "body": "Noto Sans Khmer", "description": "Google's universal Khmer font. Great fallback."}, "sort_order": 1},
    {"name": "Battambang", "data": {"heading": "Battambang", "body": "Battambang", "description": "Traditional style with a cultural feel."}, "sort_order": 2},
    {"name": "Koulen (headings only)", "data": {"heading": "Koulen", "body": None, "description": "Bold display font, headings only."}, "sort_order": 3},
]


async def seed(session: AsyncSession) -> None:
    print("Seeding users...")

    admin = User(
        name="Studio Admin",
        email="admin@studio.com",
        password_hash=hash_password("Admin1234!"),
        role=UserRole.admin,
    )
    designer = User(
        name="Jane Designer",
        email="designer@studio.com",
        password_hash=hash_password("Design1234!"),
        role=UserRole.designer,
    )
    session.add_all([admin, designer])
    await session.flush()

    print("Seeding style presets...")
    for p in STYLE_PRESETS:
        session.add(Preset(kind=PresetKind.style, **p))

    print("Seeding font presets...")
    for p in FONT_PRESETS:
        session.add(Preset(kind=PresetKind.font, **p))

    print("Seeding Khmer font presets...")
    for p in KHMER_FONT_PRESETS:
        session.add(Preset(kind=PresetKind.khmer_font, **p))

    await session.flush()

    print("Seeding sample projects...")
    project1 = Project(
        owner_id=designer.id,
        client_name="Angkor Coffee Co.",
        client_contact={"email": "hello@angkorcoffee.com", "phone": "+855 12 345 678", "telegram": "@angkorcoffee"},
        brand_name="Angkor Coffee",
        project_type=ProjectType.website,
        status=ProjectStatus.sent,
        deadline=date.today() + timedelta(days=14),
        internal_notes="Client loves warm earthy tones. Wants Khmer support.",
    )
    project2 = Project(
        owner_id=admin.id,
        client_name="SkyTech Solutions",
        client_contact={"email": "cto@skytech.io"},
        brand_name="SkyTech",
        project_type=ProjectType.mobile_app,
        status=ProjectStatus.draft,
        deadline=date.today() + timedelta(days=30),
        internal_notes="B2B SaaS. Professional and minimal.",
    )
    session.add_all([project1, project2])
    await session.flush()

    print("Done! Seeded:")
    print("  Users: admin@studio.com (Admin1234!) | designer@studio.com (Design1234!)")
    print(f"  Projects: {project1.brand_name} ({project1.status.value}), {project2.brand_name} ({project2.status.value})")
    print(f"  Presets: {len(STYLE_PRESETS)} style, {len(FONT_PRESETS)} font, {len(KHMER_FONT_PRESETS)} Khmer font")


async def main() -> None:
    engine = create_async_engine(settings.database_url, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with AsyncSessionLocal() as session:
        async with session.begin():
            await seed(session)
    await engine.dispose()
    print("\nSeed complete.")


if __name__ == "__main__":
    asyncio.run(main())
