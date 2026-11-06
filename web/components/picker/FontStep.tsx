"use client";
import { Fonts, ALLOWED_HEADING_FONTS, ALLOWED_BODY_FONTS, ALLOWED_KHMER_FONTS } from "@/lib/design-rules";
import { Label } from "@/components/ui/label";

interface Props {
  value: Partial<Fonts>;
  onChange: (v: Partial<Fonts>) => void;
}

function FontSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        {options.map((f) => (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              value === f
                ? "border-[--color-primary] bg-[--color-primary]/10 font-medium"
                : "border-[--color-border] hover:bg-[--color-muted]"
            }`}
          >
            <span style={{ fontFamily: f }}>{f}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FontStep({ value, onChange }: Props) {
  const hasKhmer = value.languages?.includes("km");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Typography</h2>
        <p className="mt-1 text-sm text-[--color-muted-foreground]">
          Choose fonts for headings and body text.
        </p>
      </div>

      <FontSelector
        label="Heading font"
        options={ALLOWED_HEADING_FONTS}
        value={value.heading}
        onChange={(v) => onChange({ ...value, heading: v })}
      />

      <FontSelector
        label="Body font"
        options={ALLOWED_BODY_FONTS}
        value={value.body}
        onChange={(v) => onChange({ ...value, body: v })}
      />

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex gap-3">
          {(["en", "km"] as const).map((lang) => {
            const checked = value.languages?.includes(lang) ?? (lang === "en");
            return (
              <label key={lang} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const langs = value.languages ?? ["en"];
                    const next = e.target.checked
                      ? [...new Set([...langs, lang])]
                      : langs.filter((l) => l !== lang);
                    onChange({ ...value, languages: next.length ? next : ["en"] });
                  }}
                  className="h-4 w-4 rounded"
                />
                {lang === "en" ? "English" : "ភាសាខ្មែរ (Khmer)"}
              </label>
            );
          })}
        </div>
      </div>

      {hasKhmer && (
        <>
          <FontSelector
            label="Khmer heading font"
            options={ALLOWED_KHMER_FONTS}
            value={value.khmer_heading}
            onChange={(v) => onChange({ ...value, khmer_heading: v })}
          />
          <FontSelector
            label="Khmer body font"
            options={ALLOWED_KHMER_FONTS}
            value={value.khmer_body}
            onChange={(v) => onChange({ ...value, khmer_body: v })}
          />
        </>
      )}

      <div className="space-y-2">
        <Label>Type scale ratio</Label>
        <div className="flex gap-2">
          {([1.2, 1.25, 1.333] as const).map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...value, scale_ratio: r })}
              className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                (value.scale_ratio ?? 1.25) === r
                  ? "border-[--color-primary] bg-[--color-primary]/10 font-medium"
                  : "border-[--color-border] hover:bg-[--color-muted]"
              }`}
            >
              {r === 1.2 ? "Minor Third" : r === 1.25 ? "Major Third" : "Perfect Fourth"}
              <span className="ml-1 text-xs text-[--color-muted-foreground]">({r})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
