import type { components } from "@/lib/api/schema";
import { useApiQuery, type ApiRequester } from "@/lib/api/use-api-query";

type PagedColaboradores = components["schemas"]["PagedColaboradores"];

interface UseColaboradoresOptions {
  query: string;
  offset: number;
  limit: number;
  status?: components["parameters"]["Status"];
  requester?: ApiRequester;
}

export function useColaboradores({
  query,
  offset,
  limit,
  status,
  requester,
}: UseColaboradoresOptions) {
  const search = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const normalizedQuery = query.trim();
  if (normalizedQuery) search.set("query", normalizedQuery);
  if (status) search.set("status", status);

  return useApiQuery<PagedColaboradores>(`/api/colaboradores?${search}`, requester);
}
