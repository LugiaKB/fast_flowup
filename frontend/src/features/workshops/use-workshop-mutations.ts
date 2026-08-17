import { useAuth } from "@/features/auth/auth-provider";
import type { components } from "@/lib/api/schema";

type ArchiveReason = components["schemas"]["ArchiveReason"];
type CreateWorkshopRequest = components["schemas"]["CreateWorkshopRequest"];
type WorkshopDetail = components["schemas"]["WorkshopDetail"];
type WorkshopInput = components["schemas"]["WorkshopInput"];

export function useWorkshopMutations() {
  const { request } = useAuth();
  return {
    create(input: CreateWorkshopRequest) {
      return request<WorkshopDetail>("/api/workshops", { method: "POST", body: input });
    },
    update(id: number, input: WorkshopInput) {
      return request<WorkshopDetail>(`/api/workshops/${id}`, { method: "PUT", body: input });
    },
    archive(id: number, reason: ArchiveReason) {
      return request<void>(`/api/workshops/${id}`, {
        method: "DELETE",
        body: { reason },
      });
    },
    restore(id: number) {
      return request<WorkshopDetail>(`/api/workshops/${id}/restaurar`, { method: "POST" });
    },
  };
}
