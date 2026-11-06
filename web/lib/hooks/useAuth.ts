"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer";
  created_at: string;
}

export function useMe() {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/api/v1/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post<User>("/api/v1/auth/login", { email, password }),
    onSuccess: (user) => {
      qc.setQueryData(["me"], user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post("/api/v1/auth/logout"),
    onSuccess: () => {
      qc.clear();
      router.push("/login");
    },
  });
}
