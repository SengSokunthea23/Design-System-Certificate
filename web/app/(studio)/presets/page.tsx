"use client";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePresets, useCreatePreset, useUpdatePreset, useDeletePreset, Preset } from "@/lib/hooks/usePresets";

function PresetCard({ preset }: { preset: Preset }) {
  const update = useUpdatePreset(preset.id);
  const del = useDeletePreset(preset.id);

  return (
    <Card className={!preset.is_active ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">{preset.name}</CardTitle>
          <Badge variant={preset.is_active ? "approved" : "draft"} className="text-xs">
            {preset.is_active ? "Active" : "Hidden"}
          </Badge>
        </div>
        <p className="text-xs text-[--color-muted-foreground] capitalize">{preset.kind}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-[--color-muted-foreground] font-mono bg-[--color-muted] rounded p-2 max-h-20 overflow-hidden">
          {JSON.stringify(preset.data, null, 2).slice(0, 150)}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"
            onClick={() => update.mutate({ is_active: !preset.is_active })} disabled={update.isPending}>
            {preset.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preset.is_active ? "Hide" : "Show"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-red-600 hover:bg-red-50"
            onClick={() => { if (confirm(`Delete "${preset.name}"?`)) del.mutate(); }} disabled={del.isPending}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreatePresetModal({ onClose }: { onClose: () => void }) {
  const create = useCreatePreset();
  const [kind, setKind] = useState<"style" | "font">("style");
  const [name, setName] = useState("");
  const [dataJson, setDataJson] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let data: Record<string, unknown>;
    try { data = JSON.parse(dataJson); setJsonError(""); }
    catch { setJsonError("Invalid JSON"); return; }
    create.mutate({ kind, name, data, sort_order: 0, is_active: true }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-[--color-background] shadow-xl">
        <div className="border-b border-[--color-border] p-6">
          <h2 className="text-lg font-semibold">New preset</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <div className="flex gap-2">
              {(["style", "font"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                    kind === k ? "border-[--color-primary] bg-[--color-primary]/10 font-medium" : "border-[--color-border] hover:bg-[--color-muted]"
                  }`}>{k}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preset-name">Name</Label>
            <Input id="preset-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Modern & Clean" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preset-data">Data (JSON)</Label>
            <textarea id="preset-data" value={dataJson} onChange={(e) => setDataJson(e.target.value)} rows={5}
              className="w-full rounded-md border border-[--color-border] bg-[--color-background] p-2 font-mono text-xs resize-none" />
            {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PresetsPage() {
  const { data: presets, isLoading } = usePresets();
  const [showCreate, setShowCreate] = useState(false);
  const styles = presets?.filter((p) => p.kind === "style") ?? [];
  const fonts = presets?.filter((p) => p.kind === "font") ?? [];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Presets</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New preset
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[--color-muted-foreground]">Loading…</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-[--color-muted-foreground]">Style presets</h2>
            {styles.length === 0 ? <p className="text-sm text-[--color-muted-foreground]">No style presets.</p> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{styles.map((p) => <PresetCard key={p.id} preset={p} />)}</div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-[--color-muted-foreground]">Font presets</h2>
            {fonts.length === 0 ? <p className="text-sm text-[--color-muted-foreground]">No font presets.</p> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fonts.map((p) => <PresetCard key={p.id} preset={p} />)}</div>
            )}
          </section>
        </div>
      )}

      {showCreate && <CreatePresetModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
