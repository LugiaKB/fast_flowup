import { http, HttpResponse } from "msw";

import type { components } from "@/lib/api/schema";

import { colaboradorArquivadoFixture, workshopsFixture } from "../fixtures";

type PagedWorkshops = components["schemas"]["PagedWorkshops"];
type ProblemDetails = components["schemas"]["ProblemDetails"];
type WorkshopSummary = components["schemas"]["WorkshopSummary"];

function problem(status: number, code: string, title: string): ProblemDetails {
  return { type: "about:blank", title, status, code };
}

function parseInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export const workshopsHandlers = [
  http.get("*/api/workshops", ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get("query") ?? "").trim();
    const offset = parseInteger(url.searchParams.get("offset"), 0);
    const limit = parseInteger(url.searchParams.get("limit"), 20);
    const invalid =
      query.length > 200 ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100;

    if (invalid) {
      return HttpResponse.json(problem(400, "validation_error", "Parâmetros de consulta inválidos"), {
        status: 400,
        headers: { "Content-Type": "application/problem+json" },
      });
    }

    const normalizedQuery = query.toLocaleLowerCase("pt-BR");
    const matching = workshopsFixture
      .filter(({ status }) => status === "active")
      .filter(({ nome, descricao }) =>
        `${nome} ${descricao}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
      )
      .toSorted(
        (left, right) =>
          new Date(right.dataRealizacao).getTime() - new Date(left.dataRealizacao).getTime(),
      );
    const summaries: WorkshopSummary[] = matching.map((workshop) => ({
      id: workshop.id,
      nome: workshop.nome,
      descricao: workshop.descricao,
      dataRealizacao: workshop.dataRealizacao,
      dataTermino: workshop.dataTermino,
      status: workshop.status,
      participantCount: workshop.participantCount,
    }));
    const response: PagedWorkshops = {
      items: summaries.slice(offset, offset + limit),
      totalItems: summaries.length,
      offset,
      limit,
    };

    return HttpResponse.json(response);
  }),
  http.get("*/api/workshops/:id", ({ params }) => {
    const id = Number(params.id);
    const workshop = workshopsFixture.find(
      (candidate) => candidate.id === id && candidate.status === "active",
    );

    if (!workshop) {
      return HttpResponse.json(problem(404, "workshop_not_found", "Workshop não encontrado"), {
        status: 404,
        headers: { "Content-Type": "application/problem+json" },
      });
    }

    const associatedParticipants =
      workshop.id === 1
        ? [...workshop.participantes, colaboradorArquivadoFixture]
        : workshop.participantes;
    return HttpResponse.json({
      ...workshop,
      participantes: associatedParticipants.filter(({ status }) => status === "active"),
      archiveEvents: [],
    });
  }),
];
