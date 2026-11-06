"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Preset {
  id: string;
  kind: "style" | "font";
  name: string;
  data: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export function usePresets(kind?: "style" | "font") {
  return useQuery({
    queryKey: ["presets", kind],
    queryFn: () => {
      const qs = kind ? `?kind=${kind}` : "";
      return api.get<Preset[]>(`/api/v1/presets${qs}`);
    },
  });
}

export function useCreatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Preset, "id" | "created_at">) =>
      api.post<Preset>("/api/v1/presets", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presets"] }),
  });
}

export function useUpdatePreset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Preset>) =>
      api.patch<Preset>(`/api/v1/presets/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presets"] }),
  });
}

export function useDeletePreset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/api/v1/presets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presets"] }),
  });
}
