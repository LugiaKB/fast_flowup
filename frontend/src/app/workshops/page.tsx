"use client";

import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Card, EmptyState, ErrorState, LoadingState, Pagination, SearchField } from "@/components/ui";
import { formatWorkshopDate } from "@/features/workshops/format-workshop";
import { useWorkshops } from "@/features/workshops/use-workshops";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PAGE_SIZE = 6;

export default function WorkshopsPage() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 250);
  const { data, error, isLoading, refetch } = useWorkshops({
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
        <h1 className="text-3xl font-bold sm:text-4xl">Workshops</h1>
        <p className="mt-3 text-lg text-gray-700">
          Explore os encontros realizados e consulte quem participou de cada tema.
        </p>
      </div>

      <div className="mt-8 max-w-xl">
        <SearchField
          label="Buscar workshops"
          placeholder="Digite um tema ou descrição"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
        />
      </div>

      <div className="mt-10">
        {isLoading && <LoadingState label="Carregando workshops" />}
        {!isLoading && error && (
          <ErrorState
            description="Não foi possível consultar os workshops. Tente novamente."
            onRetry={refetch}
          />
        )}
        {!isLoading && !error && data?.totalItems === 0 && (
          <EmptyState
            title="Nenhum workshop encontrado"
            description="Tente ajustar os termos da busca para encontrar outro encontro."
          />
        )}
        {!isLoading && !error && data && data.totalItems > 0 && (
          <section aria-labelledby="workshop-results-title">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 id="workshop-results-title" className="text-xl font-semibold">
                Resultados
              </h2>
              <p aria-live="polite" className="text-sm text-gray-700">
                {data.totalItems}{" "}
                {data.totalItems === 1 ? "workshop encontrado" : "workshops encontrados"}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((workshop) => (
                <li key={workshop.id}>
                  <Link
                    href={`/workshops/${workshop.id}`}
                    aria-label={`Ver detalhes de ${workshop.nome}`}
                    className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <Card className="h-full">
                      <h3 className="text-xl font-semibold">{workshop.nome}</h3>
                      <p className="mt-3 text-gray-700">{workshop.descricao}</p>
                      <div className="mt-6 grid gap-2 text-sm text-gray-700">
                        <p className="flex items-center gap-2">
                          <CalendarDays aria-hidden="true" className="size-5 text-primary" />
                          {formatWorkshopDate(workshop.dataRealizacao)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users aria-hidden="true" className="size-5 text-primary" />
                          {workshop.participantCount}{" "}
                          {workshop.participantCount === 1 ? "participante" : "participantes"}
                        </p>
                      </div>
                    </Card>
                  </Link>
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
