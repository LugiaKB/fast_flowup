import type { components } from "@/lib/api/schema";
import { useApiQuery, type ApiRequester } from "@/lib/api/use-api-query";

type PagedWorkshops = components["schemas"]["PagedWorkshops"];
type WorkshopDetail = components["schemas"]["WorkshopDetail"];

interface UseWorkshopsOptions {
  query: string;
  offset: number;
  limit: number;
  status?: components["parameters"]["Status"];
  requester?: ApiRequester;
}

export function useWorkshops({ query, offset, limit, status, requester }: UseWorkshopsOptions) {
  const search = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const normalizedQuery = query.trim();
  if (normalizedQuery) search.set("query", normalizedQuery);
  if (status) search.set("status", status);

  return useApiQuery<PagedWorkshops>(`/api/workshops?${search}`, requester);
}

export function useWorkshop(id: number | null, requester?: ApiRequester) {
  return useApiQuery<WorkshopDetail>(id ? `/api/workshops/${id}` : null, requester);
}
