"use client";
import { DesignRules } from "@/lib/design-rules";
import { generateScale } from "@/lib/color-scale";

interface Props {
  rules: Partial<DesignRules>;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function contrastRatio(fg: string, bg: string): number {
  const fgL = relativeLuminance(...hexToRgb(fg));
  const bgL = relativeLuminance(...hexToRgb(bg));
  const lighter = Math.max(fgL, bgL);
  const darker = Math.min(fgL, bgL);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagBadge(ratio: number) {
  if (ratio >= 7) return { level: "AAA", ok: true };
  if (ratio >= 4.5) return { level: "AA", ok: true };
  if (ratio >= 3) return { level: "AA Large", ok: true };
  return { level: "Fail", ok: false };
}

export function LivePreview({ rules }: Props) {
  const primary = rules.colors?.primary ?? "#6366f1";
  const bg = rules.colors?.background ?? "#ffffff";
  const scale = generateScale(primary);

  const textColor = rules.colors?.scheme === "dark" ? "#f9fafb" : "#111827";
  const cardBg = rules.colors?.scheme === "dark" ? "#1f2937" : "#ffffff";

  const headingFont = rules.fonts?.heading ?? "Inter";
  const bodyFont = rules.fonts?.body ?? "Inter";

  const radius = {
    sharp: "0px",
    soft: "6px",
    rounded: "12px",
    pill: "9999px",
  }[rules.shape?.radius ?? "soft"];

  const btnClass = rules.shape?.button_style ?? "filled";
  const btnStyle: React.CSSProperties =
    btnClass === "filled"
      ? { backgroundColor: primary, color: "#fff", border: "none" }
      : btnClass === "outline"
      ? { backgroundColor: "transparent", color: primary, border: `2px solid ${primary}` }
      : { backgroundColor: scale[100], color: scale[700], border: "none" };

  const shadow = {
    none: "none",
    subtle: "0 1px 3px rgba(0,0,0,0.08)",
    medium: "0 4px 12px rgba(0,0,0,0.12)",
    strong: "0 8px 24px rgba(0,0,0,0.2)",
  }[rules.shape?.shadow ?? "subtle"];

  const density = { compact: "0.5rem", comfortable: "1rem", airy: "1.5rem" }[rules.shape?.density ?? "comfortable"];

  const ratio = contrastRatio(primary, bg);
  const { level, ok } = wcagBadge(ratio);

  return (
    <div className="sticky top-6 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[--color-muted-foreground]">
        Live Preview
      </p>
      <div
        className="overflow-hidden rounded-xl border border-[--color-border]"
        style={{ backgroundColor: bg }}
      >
        {/* Header */}
        <div
          className="p-4 border-b"
          style={{ borderColor: `${primary}22`, backgroundColor: scale[50] }}
        >
          <div
            className="font-semibold text-sm"
            style={{ fontFamily: headingFont, color: textColor }}
          >
            {rules.project_info?.brand_name ?? "Brand Name"}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ fontFamily: bodyFont, color: scale[600] }}
          >
            Design System Preview
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: density, backgroundColor: bg }}>
          {/* Card */}
          <div
            className="p-4 space-y-3"
            style={{ backgroundColor: cardBg, borderRadius: radius, boxShadow: shadow }}
          >
            <h3
              className="text-base font-semibold"
              style={{ fontFamily: headingFont, color: textColor }}
            >
              Welcome
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: bodyFont, color: textColor, opacity: 0.75 }}
            >
              {rules.voice?.tone === "formal"
                ? "We are delighted to present this brand identity."
                : rules.voice?.tone === "playful"
                ? "Hey! Let's build something amazing 🚀"
                : "Here's a quick look at how your brand could feel."}
            </p>
            <button
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ ...btnStyle, borderRadius: radius, padding: `0.5rem 1rem`, cursor: "default" }}
            >
              Get started
            </button>
          </div>

          {/* Color scale dots */}
          <div className="mt-3 flex gap-1">
            {([50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const).map((s) => (
              <div
                key={s}
                className="h-4 flex-1 rounded-sm"
                style={{ backgroundColor: scale[s] }}
                title={scale[s]}
              />
            ))}
          </div>

          {/* WCAG badge */}
          <div className="mt-2 flex items-center gap-2">
            <div
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: ok ? "#dcfce7" : "#fee2e2",
                color: ok ? "#166534" : "#991b1b",
              }}
            >
              WCAG {level}
            </div>
            <span className="text-xs text-[--color-muted-foreground]">
              {ratio.toFixed(1)}:1 contrast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
