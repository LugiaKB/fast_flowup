"use client";

import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge, Card, EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-provider";
import { AttendanceManagement } from "@/features/participantes/attendance-management";
import { formatWorkshopDate, formatWorkshopTimeRange } from "@/features/workshops/format-workshop";
import { WorkshopManagement } from "@/features/workshops/workshop-management";
import { useWorkshop } from "@/features/workshops/use-workshops";
import { ApiError } from "@/lib/api/client";

export default function WorkshopDetailPage() {
  const { id: routeId } = useParams<{ id: string }>();
  const parsedId = Number(routeId);
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const { request, status } = useAuth();
  const isAdmin = status === "authenticated";
  const { data, error, isLoading, refetch, updateData } = useWorkshop(
    id,
    isAdmin ? request : undefined,
  );
  const notFound = id === null || (error instanceof ApiError && error.status === 404);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)] py-12 sm:py-16"
    >
      <Link
        href="/workshops"
        className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-primary hover:text-primary-hover"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        Voltar para workshops
      </Link>

      <div className="mt-8">
        {isLoading && <LoadingState label="Carregando detalhes do workshop" />}
        {!isLoading && notFound && (
          <EmptyState
            title="Workshop não encontrado"
            description="O workshop informado não existe ou não está disponível para consulta."
          />
        )}
        {!isLoading && !notFound && error && (
          <ErrorState
            description="Não foi possível carregar os detalhes do workshop. Tente novamente."
            onRetry={refetch}
          />
        )}
        {!isLoading && !error && data && (
          <article>
            <div className="flex max-w-4xl flex-col items-start justify-between gap-6 sm:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold sm:text-4xl">{data.nome}</h1>
                  {isAdmin && (
                    <Badge tone={data.status === "active" ? "success" : "warning"}>
                      {data.status === "active" ? "Ativo" : "Arquivado"}
                    </Badge>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-body">
                  <p className="flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="size-5 text-primary" />
                    {formatWorkshopDate(data.dataRealizacao)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 aria-hidden="true" className="size-5 text-primary" />
                    {formatWorkshopTimeRange(data.dataRealizacao, data.dataTermino)}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <WorkshopManagement
                  workshop={data}
                  activeWorkshops={data.status === "active" ? [data] : []}
                  onChanged={refetch}
                />
              )}
            </div>

            <section aria-labelledby="workshop-description" className="mt-10 max-w-3xl">
              <h2 id="workshop-description" className="text-2xl font-semibold">
                Sobre o workshop
              </h2>
              <p className="mt-4 text-lg text-body">{data.descricao}</p>
            </section>

            <section aria-labelledby="workshop-participants" className="mt-12">
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 id="workshop-participants" className="text-2xl font-semibold">
                    Participantes
                  </h2>
                  <p
                    aria-label="Quantidade de participantes"
                    aria-live="polite"
                    className="mt-1 text-sm text-muted"
                  >
                    {data.participantCount}{" "}
                    {data.participantCount === 1 ? "participante" : "participantes"}
                  </p>
                </div>
                {isAdmin && data.status === "active" && (
                  <AttendanceManagement
                    workshopId={data.id}
                    participantes={data.participantes}
                    onChanged={(participantes) =>
                      updateData((current) => ({
                        ...current,
                        participantes,
                        participantCount: participantes.length,
                      }))
                    }
                  />
                )}
              </div>
              {data.participantes.length === 0 ? (
                <EmptyState
                  title="Nenhum participante registrado"
                  description="Ainda não há participantes visíveis para este workshop."
                />
              ) : (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.participantes.map((participante) => (
                    <li key={participante.id}>
                      <Card className="h-full p-5">
                        <h3 className="text-lg font-semibold">{participante.nome}</h3>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </article>
        )}
      </div>
    </main>
  );
}
