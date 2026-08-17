import type { components } from "@/lib/api/schema";

import { useAuth } from "@/features/auth/auth-provider";

type Colaborador = components["schemas"]["Colaborador"];
type ColaboradorInput = components["schemas"]["ColaboradorInput"];

export function useColaboradorMutations() {
  const { request } = useAuth();

  return {
    create(input: ColaboradorInput) {
      return request<Colaborador>("/api/colaboradores", { method: "POST", body: input });
    },
    update(id: number, input: ColaboradorInput) {
      return request<Colaborador>(`/api/colaboradores/${id}`, { method: "PUT", body: input });
    },
    archive(id: number) {
      return request<void>(`/api/colaboradores/${id}`, { method: "DELETE" });
    },
    restore(id: number) {
      return request<Colaborador>(`/api/colaboradores/${id}/restaurar`, { method: "POST" });
    },
  };
}
