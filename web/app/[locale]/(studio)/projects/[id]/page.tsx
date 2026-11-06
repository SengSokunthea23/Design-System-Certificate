"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useProject,
  useInvites,
  useCreateInvite,
  useSubmissions,
  useApprove,
  useRequestChanges,
  Submission,
} from "@/lib/hooks/useProjects";
import { api } from "@/lib/api-client";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function InviteSection({ projectId }: { projectId: string }) {
  const { data: invites } = useInvites(projectId);
  const create = useCreateInvite(projectId);
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${BASE}/pick/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const active = invites?.filter((i) => i.is_active) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Client invite links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {active.map((inv) => (
          <div key={inv.id} className="flex items-center gap-2 rounded-md bg-[--color-muted] px-3 py-2 text-xs font-mono">
            <span className="flex-1 truncate">{BASE}/pick/{inv.token ?? inv.id.slice(0, 8) + "…"}</span>
            <button
              onClick={() => copyLink(inv.token ?? "")}
              className="text-[--color-muted-foreground] hover:text-[--color-foreground]"
              aria-label="Copy link"
            >
              {copied === (inv.token ?? "") ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}
        {active.length === 0 && (
          <p className="text-xs text-[--color-muted-foreground]">No active links.</p>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => create.mutate({})}
          disabled={create.isPending}
        >
          {create.isPending ? "Creating…" : "Generate invite link"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ExportSection({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const download = async (format: string, ext: string) => {
    setLoading(format);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/projects/${projectId}/export?format=${format}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `design-tokens.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  };

  const formats = [
    { key: "css", label: "CSS Variables", ext: "css" },
    { key: "tailwind", label: "Tailwind v4 @theme", ext: "css" },
    { key: "json", label: "W3C Design Tokens", ext: "json" },
    { key: "figma", label: "Figma Tokens", ext: "json" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Export tokens</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {formats.map((f) => (
          <Button
            key={f.key}
            variant="outline"
            size="sm"
            onClick={() => download(f.key, f.ext)}
            disabled={loading === f.key}
            className="justify-start gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            {loading === f.key ? "Exporting…" : f.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function SubmissionCard({
  submission,
  projectId,
  isLatest,
}: {
  submission: Submission;
  projectId: string;
  isLatest: boolean;
}) {
  const approve = useApprove(projectId);
  const requestChanges = useRequestChanges(projectId);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);

  const rules = submission.rules as Record<string, unknown>;

  return (
    <Card className={isLatest ? "border-[--color-primary]" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Version {submission.version}</CardTitle>
          <Badge variant={submission.status as "submitted" | "approved" | "changes_requested"}>
            {submission.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-xs text-[--color-muted-foreground]">
          {new Date(submission.submitted_at).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Colors preview */}
        {!!rules.colors && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Colors</p>
            <div className="flex gap-2">
              {["primary", "secondary", "neutral", "background"].map((k) => {
                const c = (rules.colors as Record<string, string>)?.[k];
                return c ? (
                  <div
                    key={k}
                    className="h-6 w-6 rounded-full border border-[--color-border]"
                    style={{ backgroundColor: c }}
                    title={`${k}: ${c}`}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Fonts preview */}
        {!!rules.fonts && (
          <div>
            <p className="text-xs font-medium">Fonts</p>
            <p className="text-xs text-[--color-muted-foreground]">
              {(rules.fonts as Record<string, string>).heading} /{" "}
              {(rules.fonts as Record<string, string>).body}
            </p>
          </div>
        )}

        {/* Actions for latest submitted */}
        {isLatest && submission.status === "submitted" && (
          <div className="space-y-2 pt-2">
            <Button
              className="w-full"
              onClick={() => approve.mutate()}
              disabled={approve.isPending}
            >
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
            {!showComment ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowComment(true)}
              >
                Request changes
              </Button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe what needs to change…"
                  rows={3}
                  className="w-full rounded-md border border-[--color-border] bg-[--color-background] p-2 text-sm resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowComment(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      requestChanges.mutate(comment, {
                        onSuccess: () => { setShowComment(false); setComment(""); },
                      })
                    }
                    disabled={requestChanges.isPending || !comment.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);
  const { data: submissions } = useSubmissions(id);

  if (isLoading) {
    return <div className="p-8 text-sm text-[--color-muted-foreground]">Loading…</div>;
  }
  if (!project) {
    return <div className="p-8 text-sm text-red-600">Project not found.</div>;
  }

  const sorted = [...(submissions ?? [])].sort((a, b) => b.version - a.version);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{project.brand_name}</h1>
          <p className="text-sm text-[--color-muted-foreground]">{project.client_name}</p>
        </div>
        <Badge variant={project.status}>{project.status.replace("_", " ")}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Project details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[--color-muted-foreground]">Type</span>
                <span className="capitalize">{project.project_type.replace("_", " ")}</span>
              </div>
              {project.deadline && (
                <div className="flex justify-between">
                  <span className="text-[--color-muted-foreground]">Deadline</span>
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
              {project.internal_notes && (
                <>
                  <Separator />
                  <p className="text-xs text-[--color-muted-foreground]">{project.internal_notes}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submissions */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Submissions</h2>
            {sorted.length === 0 ? (
              <p className="text-sm text-[--color-muted-foreground]">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {sorted.map((s, i) => (
                  <SubmissionCard
                    key={s.id}
                    submission={s}
                    projectId={id}
                    isLatest={i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <InviteSection projectId={id} />
          {sorted.some((s) => s.status === "approved") && (
            <ExportSection projectId={id} />
          )}
        </div>
      </div>
    </div>
  );
}
