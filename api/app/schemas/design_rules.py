"""Shared DesignRules schema — single source of truth.
   The frontend Zod schema in web/lib/design-rules.ts must be kept in sync.
"""
import re
from typing import Annotated, Literal
from pydantic import BaseModel, field_validator, Field


HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")

HexColor = Annotated[str, Field(pattern=r"^#[0-9A-Fa-f]{6}$")]

ALLOWED_HEADING_FONTS = {
    "Inter", "Plus Jakarta Sans", "DM Sans", "Outfit",
    "Playfair Display", "Lora", "Cormorant Garamond",
    "Nunito", "Poppins", "Raleway",
    "Space Grotesk", "IBM Plex Mono",
    "Merriweather", "Source Serif 4",
}

ALLOWED_BODY_FONTS = {
    "Inter", "Plus Jakarta Sans", "DM Sans",
    "Source Sans 3", "Lato", "Open Sans",
    "Nunito", "Poppins",
    "Space Grotesk",
    "Merriweather", "Source Serif 4",
}

ALLOWED_KHMER_FONTS = {
    "Kantumruy Pro", "Noto Sans Khmer", "Battambang", "Koulen",
}


class ProjectInfo(BaseModel):
    brand_name: str = Field(min_length=1, max_length=255)
    project_type: Literal["website", "mobile_app", "brand_identity", "social_media"]


class Colors(BaseModel):
    primary: HexColor
    secondary: HexColor
    neutral: HexColor
    background: HexColor
    gray_tone: Literal["cool", "warm", "pure"] = "pure"
    scheme: Literal["light", "dark"] = "light"


class Fonts(BaseModel):
    heading: str
    body: str
    khmer_heading: str | None = None
    khmer_body: str | None = None
    languages: list[Literal["en", "km"]] = ["en"]
    scale_ratio: Literal[1.2, 1.25, 1.333] = 1.25

    @field_validator("heading")
    @classmethod
    def validate_heading_font(cls, v: str) -> str:
        if v not in ALLOWED_HEADING_FONTS:
            raise ValueError(f"Heading font '{v}' is not in the allowed list")
        return v

    @field_validator("body")
    @classmethod
    def validate_body_font(cls, v: str) -> str:
        if v not in ALLOWED_BODY_FONTS:
            raise ValueError(f"Body font '{v}' is not in the allowed list")
        return v

    @field_validator("khmer_heading", "khmer_body")
    @classmethod
    def validate_khmer_font(cls, v: str | None) -> str | None:
        if v is not None and v not in ALLOWED_KHMER_FONTS:
            raise ValueError(f"Khmer font '{v}' is not in the allowed list")
        return v


class Shape(BaseModel):
    radius: Literal["sharp", "soft", "rounded", "pill"] = "soft"
    density: Literal["compact", "comfortable", "airy"] = "comfortable"
    base_unit: Literal[4, 8] = 4
    shadow: Literal["none", "subtle", "medium", "strong"] = "subtle"
    button_style: Literal["filled", "outline", "soft"] = "filled"


class Voice(BaseModel):
    tone: Literal["formal", "friendly", "playful"] = "friendly"


class DesignRules(BaseModel):
    """Complete design rules for a project. All fields optional (supports partial draft)."""

    project_info: ProjectInfo | None = None
    style_direction: str | None = None
    colors: Colors | None = None
    fonts: Fonts | None = None
    shape: Shape | None = None
    voice: Voice | None = None
    notes: str | None = Field(default=None, max_length=2000)


class DesignRulesPartial(BaseModel):
    """Accepts any subset of DesignRules — used for draft autosave."""

    model_config = {"extra": "ignore"}

    project_info: ProjectInfo | None = None
    style_direction: str | None = None
    colors: Colors | None = None
    fonts: Fonts | None = None
    shape: Shape | None = None
    voice: Voice | None = None
    notes: str | None = Field(default=None, max_length=2000)
