"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DesignRules } from "@/lib/design-rules";

interface PublicProject {
  id: string;
  brand_name: string;
  project_type: string;
  client_name: string;
}

interface InviteInfo {
  valid: boolean;
  project: PublicProject;
  draft: DesignRules | null;
}

export function useInviteInfo(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => api.get<InviteInfo>(`/api/v1/public/invite/${token}`),
    enabled: !!token,
  });
}

export function useSaveDraft(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: Partial<DesignRules>) =>
      api.post(`/api/v1/public/invite/${token}/draft`, rules),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invite", token] }),
  });
}

export function useSubmitPicker(token: string) {
  return useMutation({
    mutationFn: (rules: DesignRules) =>
      api.post(`/api/v1/public/invite/${token}/submit`, rules),
  });
}
