import type { components } from "@/lib/api/schema";
import { useApiQuery } from "@/lib/api/use-api-query";

type PagedColaboradores = components["schemas"]["PagedColaboradores"];

interface UseColaboradoresOptions {
  query: string;
  offset: number;
  limit: number;
}

export function useColaboradores({ query, offset, limit }: UseColaboradoresOptions) {
  const search = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const normalizedQuery = query.trim();
  if (normalizedQuery) search.set("query", normalizedQuery);

  return useApiQuery<PagedColaboradores>(`/api/colaboradores?${search}`);
}
