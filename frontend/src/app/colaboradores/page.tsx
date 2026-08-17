"use client";

import { useEffect, useState } from "react";

import { Card, EmptyState, ErrorState, LoadingState, Pagination, SearchField } from "@/components/ui";
import { useColaboradores } from "@/features/colaboradores/use-colaboradores";

const PAGE_SIZE = 6;

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

export default function ColaboradoresPage() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 250);
  const { data, error, isLoading, refetch } = useColaboradores({
    query: debouncedQuery,
    offset,
    limit: PAGE_SIZE,
  });

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)] py-12 sm:py-16"
    >
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Colaboradores</h1>
        <p className="mt-3 text-lg text-gray-700">
          Consulte as pessoas ativas que podem participar dos workshops.
        </p>
      </div>

      <div className="mt-8 max-w-xl">
        <SearchField
          label="Buscar colaboradores"
          placeholder="Digite parte do nome"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
        />
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
            description="Tente ajustar os termos da busca para encontrar outra pessoa."
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
                    <h3 className="text-xl font-semibold">{colaborador.nome}</h3>
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
