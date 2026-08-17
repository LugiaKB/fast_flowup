import { useAuth } from "@/features/auth/auth-provider";
import type { components } from "@/lib/api/schema";

type WorkshopDetail = components["schemas"]["WorkshopDetail"];

export function useAttendanceMutations(workshopId: number) {
  const { request } = useAuth();
  const base = `/api/workshops/${workshopId}/participantes`;
  return {
    replace(colaboradorIds: number[]) {
      return request<WorkshopDetail>(base, { method: "PUT", body: { colaboradorIds } });
    },
    add(colaboradorId: number) {
      return request<void>(`${base}/${colaboradorId}`, { method: "PUT" });
    },
    remove(colaboradorId: number) {
      return request<void>(`${base}/${colaboradorId}`, { method: "DELETE" });
    },
  };
}
