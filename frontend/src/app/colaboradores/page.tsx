"use client";

import { useState } from "react";

import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
  SearchField,
} from "@/components/ui";
import { useAuth } from "@/features/auth/auth-provider";
import {
  ColaboradorManagement,
  ColaboradorStatusSelect,
  type ColaboradorStatusFilter,
} from "@/features/colaboradores/colaborador-management";
import { useColaboradores } from "@/features/colaboradores/use-colaboradores";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PAGE_SIZE = 6;

export default function ColaboradoresPage() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ColaboradorStatusFilter>("active");
  const { request, status: authStatus } = useAuth();
  const isAdmin = authStatus === "authenticated";
  const debouncedQuery = useDebouncedValue(query, 250);
  const { data, error, isLoading, refetch } = useColaboradores({
    query: debouncedQuery,
    offset,
    limit: PAGE_SIZE,
    status: isAdmin ? statusFilter : undefined,
    requester: isAdmin ? request : undefined,
  });
  const handleChanged = () => {
    setOffset(0);
    refetch();
  };

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)] py-12 sm:py-16"
    >
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Colaboradores</h1>
          <p className="mt-3 text-lg text-gray-700">
            Consulte as pessoas ativas que podem participar dos workshops.
          </p>
        </div>
        {isAdmin && <ColaboradorManagement onChanged={handleChanged} />}
      </div>

      <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-end">
        <SearchField
          label="Buscar colaboradores"
          placeholder="Digite parte do nome"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
        />
        {isAdmin && (
          <ColaboradorStatusSelect
            value={statusFilter}
            onChange={(nextStatus) => {
              setStatusFilter(nextStatus);
              setOffset(0);
            }}
          />
        )}
      </div>

      <div className="mt-10">
        {isLoading && <LoadingState label="Carregando colaboradores" />}

        {!isLoading && error && (
          <ErrorState
            description="Não foi possível consultar os colaboradores. Tente novamente."
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && data?.totalItems === 0 && (
          <EmptyState
            title="Nenhum colaborador encontrado"
            description={
              isAdmin && statusFilter === "archived"
                ? "Nenhum colaborador está arquivado com os filtros atuais."
                : "Tente ajustar os termos da busca para encontrar outra pessoa."
            }
          />
        )}

        {!isLoading && !error && data && data.totalItems > 0 && (
          <section aria-labelledby="collaborator-results-title">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 id="collaborator-results-title" className="text-xl font-semibold">
                Resultados
              </h2>
              <p aria-live="polite" className="text-sm text-gray-700">
                {data.totalItems} {data.totalItems === 1 ? "colaborador encontrado" : "colaboradores encontrados"}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((colaborador) => (
                <li key={colaborador.id}>
                  <Card className="h-full">
                    <div className="flex h-full flex-col gap-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-xl font-semibold">{colaborador.nome}</h3>
                        {isAdmin && (
                          <Badge tone={colaborador.status === "active" ? "success" : "warning"}>
                            {colaborador.status === "active" ? "Ativo" : "Arquivado"}
                          </Badge>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="mt-auto">
                          <ColaboradorManagement colaborador={colaborador} onChanged={handleChanged} />
                        </div>
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Pagination
                offset={data.offset}
                limit={data.limit}
                totalItems={data.totalItems}
                onPageChange={setOffset}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
