"use client";
import { useState } from "react";
import { Colors } from "@/lib/design-rules";
import { generateScale } from "@/lib/color-scale";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  value: Partial<Colors>;
  onChange: (v: Partial<Colors>) => void;
}

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const scale = generateScale(value || "#888888");
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || "#888888"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-[--color-border]"
          aria-label={label}
        />
        <div>
          <Label>{label}</Label>
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="mt-1 h-8 w-32 font-mono text-xs"
          />
        </div>
      </div>
      {/* scale strip */}
      <div className="flex gap-0.5 rounded overflow-hidden h-6">
        {([50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const).map((step) => (
          <div
            key={step}
            className="flex-1"
            style={{ backgroundColor: scale[step] }}
            title={`${step}: ${scale[step]}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorStep({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Colors</h2>
        <p className="mt-1 text-sm text-[--color-muted-foreground]">
          Pick the core colors for your brand. We'll generate a full scale from each.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ColorSwatch
          label="Primary"
          value={value.primary ?? ""}
          onChange={(v) => onChange({ ...value, primary: v })}
        />
        <ColorSwatch
          label="Secondary"
          value={value.secondary ?? ""}
          onChange={(v) => onChange({ ...value, secondary: v })}
        />
        <ColorSwatch
          label="Neutral"
          value={value.neutral ?? ""}
          onChange={(v) => onChange({ ...value, neutral: v })}
        />
        <ColorSwatch
          label="Background"
          value={value.background ?? ""}
          onChange={(v) => onChange({ ...value, background: v })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Gray tone</Label>
          <div className="flex gap-2">
            {(["cool", "pure", "warm"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...value, gray_tone: t })}
                className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                  (value.gray_tone ?? "pure") === t
                    ? "border-[--color-primary] bg-[--color-primary]/10 font-medium"
                    : "border-[--color-border] hover:bg-[--color-muted]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Color scheme</Label>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChange({ ...value, scheme: s })}
                className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                  (value.scheme ?? "light") === s
                    ? "border-[--color-primary] bg-[--color-primary]/10 font-medium"
                    : "border-[--color-border] hover:bg-[--color-muted]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
