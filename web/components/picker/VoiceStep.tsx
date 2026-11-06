"use client";
import { Voice } from "@/lib/design-rules";
import { Label } from "@/components/ui/label";

const TONE_OPTIONS = [
  {
    value: "formal",
    label: "Formal",
    description: "Professional, authoritative, polished",
    example: "We are pleased to present our services.",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm, approachable, conversational",
    example: "Hey! We'd love to help you out.",
  },
  {
    value: "playful",
    label: "Playful",
    description: "Fun, energetic, creative",
    example: "Let's make something awesome together! 🎉",
  },
] as const;

interface Props {
  value: Partial<Voice>;
  notes: string;
  onChange: (v: Partial<Voice>) => void;
  onNotesChange: (n: string) => void;
}

export function VoiceStep({ value, notes, onChange, onNotesChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Voice & Tone</h2>
        <p className="mt-1 text-sm text-[--color-muted-foreground]">
          How should your brand communicate with its audience?
        </p>
      </div>

      <div className="space-y-3">
        <Label>Communication tone</Label>
        {TONE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange({ ...value, tone: o.value })}
            className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
              (value.tone ?? "friendly") === o.value
                ? "border-[--color-primary] bg-[--color-primary]/10"
                : "border-[--color-border] hover:bg-[--color-muted]"
            }`}
          >
            <div className="font-medium text-sm">{o.label}</div>
            <div className="text-xs text-[--color-muted-foreground]">{o.description}</div>
            <div className="mt-2 text-xs italic text-[--color-muted-foreground]">
              &ldquo;{o.example}&rdquo;
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Additional notes (optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Any specific requirements, inspirations, or things to avoid…"
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-[--color-border] bg-[--color-background] p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[--color-primary]/50"
        />
        <p className="text-right text-xs text-[--color-muted-foreground]">{notes.length}/2000</p>
      </div>
    </div>
  );
}
