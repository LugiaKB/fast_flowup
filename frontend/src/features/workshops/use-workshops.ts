import type { components } from "@/lib/api/schema";
import { useApiQuery } from "@/lib/api/use-api-query";

type PagedWorkshops = components["schemas"]["PagedWorkshops"];
type WorkshopDetail = components["schemas"]["WorkshopDetail"];

interface UseWorkshopsOptions {
  query: string;
  offset: number;
  limit: number;
}

export function useWorkshops({ query, offset, limit }: UseWorkshopsOptions) {
  const search = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const normalizedQuery = query.trim();
  if (normalizedQuery) search.set("query", normalizedQuery);

  return useApiQuery<PagedWorkshops>(`/api/workshops?${search}`);
}

export function useWorkshop(id: number | null) {
  return useApiQuery<WorkshopDetail>(id ? `/api/workshops/${id}` : null);
}
