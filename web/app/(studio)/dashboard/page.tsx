"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects, useCreateProject, Project } from "@/lib/hooks/useProjects";
import { ApiError } from "@/lib/api-client";

const createSchema = z.object({
  client_name: z.string().min(1, "Client name required"),
  brand_name: z.string().min(1, "Brand name required"),
  project_type: z.enum(["website", "mobile_app", "brand_identity", "social_media"]),
  deadline: z.string().optional(),
  internal_notes: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { project_type: "website" },
  });
  const create = useCreateProject();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-[--color-background] shadow-xl">
        <div className="border-b border-[--color-border] p-6">
          <h2 className="text-lg font-semibold">New project</h2>
        </div>
        <form
          onSubmit={handleSubmit((data) =>
            create.mutate(data, { onSuccess: onClose })
          )}
          className="space-y-4 p-6"
        >
          <div className="space-y-1.5">
            <Label htmlFor="client_name">Client name</Label>
            <Input id="client_name" {...register("client_name")} />
            {errors.client_name && <p className="text-xs text-red-600">{errors.client_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand_name">Brand name</Label>
            <Input id="brand_name" {...register("brand_name")} />
            {errors.brand_name && <p className="text-xs text-red-600">{errors.brand_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project_type">Type</Label>
            <select
              id="project_type"
              {...register("project_type")}
              className="w-full rounded-md border border-[--color-border] bg-[--color-background] px-3 py-2 text-sm"
            >
              <option value="website">Website</option>
              <option value="mobile_app">Mobile App</option>
              <option value="brand_identity">Brand Identity</option>
              <option value="social_media">Social Media</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="internal_notes">Internal notes (optional)</Label>
            <Input id="internal_notes" {...register("internal_notes")} />
          </div>
          {create.error instanceof ApiError && (
            <p className="text-xs text-red-600">{create.error.message}</p>
          )}
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

function statusLabel(s: Project["status"]) {
  const map: Record<Project["status"], string> = {
    draft: "Draft", sent: "Sent", submitted: "Submitted",
    changes_requested: "Changes Requested", approved: "Approved",
  };
  return map[s];
}

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useProjects({ search: search || undefined });
  const projects = data?.items ?? [];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New project
        </Button>
      </div>

      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--color-muted-foreground]" />
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-[--color-muted-foreground]">Loading…</p>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-[--color-muted-foreground]">
              No projects yet. Create your first project to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.brand_name}</CardTitle>
                    <Badge variant={p.status}>{statusLabel(p.status)}</Badge>
                  </div>
                  <p className="text-sm text-[--color-muted-foreground]">{p.client_name}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-[--color-muted-foreground]">
                    <span className="capitalize">{p.project_type.replace("_", " ")}</span>
                    {p.deadline && <span>Due {new Date(p.deadline).toLocaleDateString()}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
