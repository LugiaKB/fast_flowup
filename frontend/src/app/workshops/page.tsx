"use client";

import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge, Card, EmptyState, ErrorState, LoadingState, Pagination, SearchField } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-provider";
import { formatWorkshopDate } from "@/features/workshops/format-workshop";
import {
  WorkshopManagement,
  WorkshopStatusSelect,
  type WorkshopStatusFilter,
} from "@/features/workshops/workshop-management";
import { useWorkshops } from "@/features/workshops/use-workshops";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PAGE_SIZE = 6;

export default function WorkshopsPage() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<WorkshopStatusFilter>("active");
  const { request, status: authStatus } = useAuth();
  const isAdmin = authStatus === "authenticated";
  const debouncedQuery = useDebouncedValue(query, 250);
  const { data, error, isLoading, refetch } = useWorkshops({
    query: debouncedQuery,
    offset,
    limit: PAGE_SIZE,
    status: isAdmin ? statusFilter : undefined,
    requester: isAdmin ? request : undefined,
  });
  const activeWorkshops = data?.items.filter(({ status }) => status === "active") ?? [];
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
          <h1 className="text-3xl font-bold sm:text-4xl">Workshops</h1>
          <p className="mt-3 text-lg text-gray-700">
            Explore os encontros realizados e consulte quem participou de cada tema.
          </p>
        </div>
        {isAdmin && <WorkshopManagement activeWorkshops={activeWorkshops} onChanged={handleChanged} />}
      </div>

      <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-end">
        <SearchField
          label="Buscar workshops"
          placeholder="Digite um tema ou descrição"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
        />
        {isAdmin && (
          <WorkshopStatusSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setOffset(0);
            }}
          />
        )}
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
                  <Card className="h-full">
                    <div className="flex h-full flex-col">
                      <Link
                        href={`/workshops/${workshop.id}`}
                        aria-label={`Ver detalhes de ${workshop.nome}`}
                        className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      >
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
                      </Link>
                      {isAdmin && (
                        <div className="mt-5 grid gap-4 border-t border-gray-200 pt-5">
                          <Badge tone={workshop.status === "active" ? "success" : "warning"}>
                            {workshop.status === "active" ? "Ativo" : "Arquivado"}
                          </Badge>
                          <WorkshopManagement
                            workshop={workshop}
                            activeWorkshops={activeWorkshops}
                            onChanged={handleChanged}
                          />
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
