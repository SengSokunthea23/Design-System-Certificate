"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Project {
  id: string;
  owner_id: string;
  client_name: string;
  client_contact: Record<string, string>;
  brand_name: string;
  project_type: string;
  status: "draft" | "sent" | "submitted" | "changes_requested" | "approved";
  deadline: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invite {
  id: string;
  project_id: string;
  expires_at: string;
  revoked_at: string | null;
  first_opened_at: string | null;
  created_at: string;
  is_active: boolean;
  token?: string;
}

export interface Submission {
  id: string;
  project_id: string;
  version: number;
  rules: Record<string, unknown>;
  status: "submitted" | "changes_requested" | "approved";
  submitted_at: string;
}

export function useProjects(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.search) qs.set("search", params.search);
      return api.get<{ items: Project[]; total: number }>(`/api/v1/projects?${qs}`);
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => api.get<Project>(`/api/v1/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project> & { client_contact?: Record<string, string> }) =>
      api.post<Project>("/api/v1/projects", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useCreateInvite(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { expires_days?: number } = {}) =>
      api.post<Invite>(`/api/v1/projects/${projectId}/invites`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invites", projectId] }),
  });
}

export function useInvites(projectId: string) {
  return useQuery({
    queryKey: ["invites", projectId],
    queryFn: () => api.get<Invite[]>(`/api/v1/projects/${projectId}/invites`),
    enabled: !!projectId,
  });
}

export function useSubmissions(projectId: string) {
  return useQuery({
    queryKey: ["submissions", projectId],
    queryFn: () => api.get<Submission[]>(`/api/v1/projects/${projectId}/submissions`),
    enabled: !!projectId,
  });
}

export function useApprove(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/api/v1/projects/${projectId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["submissions", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useRequestChanges(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) =>
      api.post(`/api/v1/projects/${projectId}/request-changes`, { comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["submissions", projectId] });
    },
  });
}
