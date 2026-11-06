"""Export design rules to various token formats."""
import json
from typing import Any


def _rules_to_flat(rules: dict) -> dict[str, str]:
    colors = rules.get("colors", {})
    fonts = rules.get("fonts", {})
    shape = rules.get("shape", {})
    voice = rules.get("voice", {})
    return {
        "color-primary": colors.get("primary", "#2563EB"),
        "color-secondary": colors.get("secondary", "#7C3AED"),
        "color-neutral": colors.get("neutral", "#6B7280"),
        "color-background": colors.get("background", "#FFFFFF"),
        "font-heading": fonts.get("heading", "Inter"),
        "font-body": fonts.get("body", "Inter"),
        "font-khmer-heading": fonts.get("khmer_heading") or "",
        "font-khmer-body": fonts.get("khmer_body") or "",
        "font-scale": str(fonts.get("scale_ratio", 1.25)),
        "radius": _radius_value(shape.get("radius", "soft")),
        "density": shape.get("density", "comfortable"),
        "shadow": shape.get("shadow", "subtle"),
        "button-style": shape.get("button_style", "filled"),
        "voice-tone": voice.get("tone", "friendly"),
    }


def _radius_value(key: str) -> str:
    return {"sharp": "0px", "soft": "6px", "rounded": "12px", "pill": "9999px"}.get(key, "6px")


def to_css_variables(rules: dict) -> str:
    flat = _rules_to_flat(rules)
    brand = rules.get("project_info", {}).get("brand_name", "Brand")
    lines = [f"/* Design tokens for {brand} */", ":root {"]
    for k, v in flat.items():
        if v:
            lines.append(f"  --{k}: {v};")
    lines.append("}")
    return "\n".join(lines)


def to_tailwind_theme(rules: dict) -> str:
    flat = _rules_to_flat(rules)
    brand = rules.get("project_info", {}).get("brand_name", "Brand")
    lines = [f"/* Tailwind v4 @theme for {brand} */", "@theme {"]
    for k, v in flat.items():
        if v:
            lines.append(f"  --color-brand-{k}: {v};" if k.startswith("color") else f"  --{k}: {v};")
    lines.append("}")
    return "\n".join(lines)


def to_w3c_tokens(rules: dict) -> str:
    colors = rules.get("colors", {})
    fonts = rules.get("fonts", {})
    shape = rules.get("shape", {})

    tokens: dict[str, Any] = {
        "color": {
            "primary":    {"$value": colors.get("primary", "#2563EB"), "$type": "color"},
            "secondary":  {"$value": colors.get("secondary", "#7C3AED"), "$type": "color"},
            "neutral":    {"$value": colors.get("neutral", "#6B7280"), "$type": "color"},
            "background": {"$value": colors.get("background", "#FFFFFF"), "$type": "color"},
        },
        "fontFamily": {
            "heading": {"$value": fonts.get("heading", "Inter"), "$type": "fontFamily"},
            "body":    {"$value": fonts.get("body", "Inter"), "$type": "fontFamily"},
        },
        "borderRadius": {
            "default": {"$value": _radius_value(shape.get("radius", "soft")), "$type": "dimension"},
        },
        "shadow": {
            "default": {"$value": _shadow_value(shape.get("shadow", "subtle")), "$type": "shadow"},
        },
    }
    if fonts.get("khmer_heading"):
        tokens["fontFamily"]["khmerHeading"] = {"$value": fonts["khmer_heading"], "$type": "fontFamily"}
    if fonts.get("khmer_body"):
        tokens["fontFamily"]["khmerBody"] = {"$value": fonts["khmer_body"], "$type": "fontFamily"}
    return json.dumps(tokens, indent=2)


def to_figma_tokens(rules: dict) -> str:
    colors = rules.get("colors", {})
    fonts = rules.get("fonts", {})
    shape = rules.get("shape", {})
    tokens = {
        "global": {
            "color": {
                "primary":    {"value": colors.get("primary", "#2563EB"), "type": "color"},
                "secondary":  {"value": colors.get("secondary", "#7C3AED"), "type": "color"},
                "neutral":    {"value": colors.get("neutral", "#6B7280"), "type": "color"},
                "background": {"value": colors.get("background", "#FFFFFF"), "type": "color"},
            },
            "fontFamilies": {
                "heading": {"value": fonts.get("heading", "Inter"), "type": "fontFamilies"},
                "body":    {"value": fonts.get("body", "Inter"), "type": "fontFamilies"},
            },
            "borderRadius": {
                "default": {"value": _radius_value(shape.get("radius", "soft")), "type": "borderRadius"},
            },
        }
    }
    return json.dumps(tokens, indent=2)


def to_pdf_html(rules: dict, brand_name: str) -> str:
    css = to_css_variables(rules)
    colors = rules.get("colors", {})
    fonts = rules.get("fonts", {})
    shape = rules.get("shape", {})
    voice = rules.get("voice", {})
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Design Brief — {brand_name}</title>
<style>
{css}
body {{ font-family: Arial, sans-serif; padding: 40px; color: #111; }}
h1 {{ color: var(--color-primary); }}
table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
td, th {{ padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; }}
th {{ background: #f9fafb; font-weight: 600; }}
.swatch {{ width: 24px; height: 24px; display: inline-block; border-radius: 4px; vertical-align: middle; margin-right: 8px; border: 1px solid #e5e7eb; }}
@media print {{ body {{ padding: 0; }} }}
</style>
</head>
<body>
<h1>Design Brief: {brand_name}</h1>
<h2>Colors</h2>
<table>
<tr><th>Role</th><th>Hex</th></tr>
<tr><td>Primary</td><td><span class="swatch" style="background:{colors.get('primary','#2563EB')}"></span>{colors.get('primary','')}</td></tr>
<tr><td>Secondary</td><td><span class="swatch" style="background:{colors.get('secondary','#7C3AED')}"></span>{colors.get('secondary','')}</td></tr>
<tr><td>Neutral</td><td><span class="swatch" style="background:{colors.get('neutral','#6B7280')}"></span>{colors.get('neutral','')}</td></tr>
<tr><td>Background</td><td><span class="swatch" style="background:{colors.get('background','#FFF')}"></span>{colors.get('background','')}</td></tr>
</table>
<h2>Typography</h2>
<table>
<tr><th>Role</th><th>Font</th></tr>
<tr><td>Heading</td><td>{fonts.get('heading','')}</td></tr>
<tr><td>Body</td><td>{fonts.get('body','')}</td></tr>
<tr><td>Type Scale</td><td>{fonts.get('scale_ratio','')}</td></tr>
</table>
<h2>Shape &amp; Spacing</h2>
<table>
<tr><th>Property</th><th>Value</th></tr>
<tr><td>Corner radius</td><td>{shape.get('radius','')}</td></tr>
<tr><td>Density</td><td>{shape.get('density','')}</td></tr>
<tr><td>Shadow</td><td>{shape.get('shadow','')}</td></tr>
<tr><td>Button style</td><td>{shape.get('button_style','')}</td></tr>
</table>
<h2>Voice &amp; Tone</h2>
<p><strong>Tone:</strong> {voice.get('tone','')}</p>
</body>
</html>"""


def _shadow_value(key: str) -> str:
    return {
        "none": "none",
        "subtle": "0 1px 3px rgba(0,0,0,0.08)",
        "medium": "0 4px 12px rgba(0,0,0,0.12)",
        "strong": "0 8px 24px rgba(0,0,0,0.18)",
    }.get(key, "none")
