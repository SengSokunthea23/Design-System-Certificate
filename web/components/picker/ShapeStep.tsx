"use client";
import { Shape } from "@/lib/design-rules";
import { Label } from "@/components/ui/label";

interface Props {
  value: Partial<Shape>;
  onChange: (v: Partial<Shape>) => void;
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              value === o.value
                ? "border-[--color-primary] bg-[--color-primary]/10 font-medium"
                : "border-[--color-border] hover:bg-[--color-muted]"
            }`}
          >
            <div>{o.label}</div>
            {o.description && (
              <div className="mt-0.5 text-xs text-[--color-muted-foreground]">{o.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShapeStep({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Shape & Layout</h2>
        <p className="mt-1 text-sm text-[--color-muted-foreground]">
          Define the visual feel through corners, spacing, and shadows.
        </p>
      </div>

      {/* Radius preview */}
      <div className="space-y-2">
        <Label>Corner radius</Label>
        <div className="flex gap-3">
          {(["sharp", "soft", "rounded", "pill"] as const).map((r) => {
            const radius = { sharp: "0px", soft: "6px", rounded: "12px", pill: "9999px" }[r];
            return (
              <button
                key={r}
                onClick={() => onChange({ ...value, radius: r })}
                className={`flex flex-1 flex-col items-center gap-2 rounded-md border p-3 text-sm transition-colors ${
                  (value.radius ?? "soft") === r
                    ? "border-[--color-primary] bg-[--color-primary]/10"
                    : "border-[--color-border] hover:bg-[--color-muted]"
                }`}
              >
                <div
                  className="h-8 w-full bg-[--color-primary]/30"
                  style={{ borderRadius: radius }}
                />
                <span className="capitalize">{r}</span>
              </button>
            );
          })}
        </div>
      </div>

      <OptionGroup
        label="Spacing density"
        value={value.density ?? "comfortable"}
        onChange={(v) => onChange({ ...value, density: v })}
        options={[
          { value: "compact", label: "Compact", description: "Less whitespace" },
          { value: "comfortable", label: "Comfortable", description: "Balanced" },
          { value: "airy", label: "Airy", description: "Lots of space" },
        ]}
      />

      <OptionGroup
        label="Base unit"
        value={String(value.base_unit ?? 4) as "4" | "8"}
        onChange={(v) => onChange({ ...value, base_unit: Number(v) as 4 | 8 })}
        options={[
          { value: "4", label: "4px", description: "Fine-grained" },
          { value: "8", label: "8px", description: "Coarser grid" },
        ]}
      />

      <OptionGroup
        label="Shadows"
        value={value.shadow ?? "subtle"}
        onChange={(v) => onChange({ ...value, shadow: v })}
        options={[
          { value: "none", label: "None", description: "Flat" },
          { value: "subtle", label: "Subtle", description: "Light depth" },
          { value: "medium", label: "Medium", description: "Clear depth" },
          { value: "strong", label: "Strong", description: "High contrast" },
        ]}
      />

      <OptionGroup
        label="Button style"
        value={value.button_style ?? "filled"}
        onChange={(v) => onChange({ ...value, button_style: v })}
        options={[
          { value: "filled", label: "Filled", description: "Solid background" },
          { value: "outline", label: "Outline", description: "Border only" },
          { value: "soft", label: "Soft", description: "Tinted background" },
        ]}
      />
    </div>
  );
}
