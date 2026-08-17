import { http, HttpResponse } from "msw";

import { validateWorkshopSchedule } from "@/features/workshops/workshop-validation";
import type { components } from "@/lib/api/schema";

import { findMockColaborador } from "../data/colaboradores";
import {
  archiveMockWorkshop,
  createMockWorkshop,
  findMockWorkshop,
  listMockWorkshops,
  restoreMockWorkshop,
  updateMockWorkshop,
  type WorkshopDetail,
} from "../data/workshops";
import { isMockAuthorized } from "./auth";

type ArchiveReason = components["schemas"]["ArchiveReason"];
type CreateWorkshopRequest = components["schemas"]["CreateWorkshopRequest"];
type PagedWorkshops = components["schemas"]["PagedWorkshops"];
type ProblemDetails = components["schemas"]["ProblemDetails"];
type StatusFilter = components["parameters"]["Status"];
type WorkshopInput = components["schemas"]["WorkshopInput"];
type WorkshopSummary = components["schemas"]["WorkshopSummary"];

function problem(status: number, code: string, title: string, detail?: string): ProblemDetails {
  return { type: "about:blank", title, status, code, detail };
}

function problemResponse(status: number, code: string, title: string, detail?: string) {
  return HttpResponse.json(problem(status, code, title, detail), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });
}

function parseInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function quarterKey(timestamp: string) {
  const [year, month] = timestamp.slice(0, 7).split("-").map(Number);
  return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
}

function activeParticipantsFor(workshop: WorkshopDetail) {
  const participantIds = workshop.participantes.map(({ id }) => id);
  if (workshop.id === 1 && !participantIds.includes(9)) participantIds.push(9);
  return participantIds
    .map(findMockColaborador)
    .filter((participant) => participant?.status === "active");
}

function summaryFor(workshop: WorkshopDetail): WorkshopSummary {
  return {
    id: workshop.id,
    nome: workshop.nome,
    descricao: workshop.descricao,
    dataRealizacao: workshop.dataRealizacao,
    dataTermino: workshop.dataTermino,
    status: workshop.status,
    archivedAt: workshop.archivedAt,
    participantCount: activeParticipantsFor(workshop).length,
  };
}

function requireAuthorization(request: Request) {
  return isMockAuthorized(request)
    ? undefined
    : problemResponse(401, "unauthorized", "Autenticação administrativa necessária");
}

function validateInput(input: Partial<WorkshopInput>, currentId?: number) {
  if (typeof input.nome !== "string" || !input.nome.trim()) {
    return problemResponse(400, "validation_error", "Informe o nome do workshop");
  }
  if (typeof input.descricao !== "string" || !input.descricao.trim()) {
    return problemResponse(400, "validation_error", "Informe a descrição do workshop");
  }
  if (typeof input.dataRealizacao !== "string") {
    return problemResponse(400, "validation_error", "Informe a data de realização");
  }
  const scheduleError = validateWorkshopSchedule(
    input.dataRealizacao,
    listMockWorkshops().map(summaryFor),
    currentId,
  );
  if (scheduleError) {
    const conflict = scheduleError.includes("trimestre");
    return problemResponse(
      conflict ? 409 : 400,
      conflict ? "quarter_conflict" : "invalid_schedule",
      scheduleError,
    );
  }
  return undefined;
}

export const workshopsHandlers = [
  http.get("*/api/workshops", ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get("query") ?? "").trim();
    const offset = parseInteger(url.searchParams.get("offset"), 0);
    const limit = parseInteger(url.searchParams.get("limit"), 20);
    const status = (url.searchParams.get("status") ?? "active") as StatusFilter;
    const invalid =
      query.length > 200 ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !(["active", "archived", "all"] as string[]).includes(status);
    if (invalid) {
      return problemResponse(400, "validation_error", "Parâmetros de consulta inválidos");
    }
    if (status !== "active") {
      const unauthorized = requireAuthorization(request);
      if (unauthorized) return unauthorized;
    }

    const normalizedQuery = query.toLocaleLowerCase("pt-BR");
    const matching = listMockWorkshops()
      .filter((workshop) => status === "all" || workshop.status === status)
      .filter(({ nome, descricao }) =>
        `${nome} ${descricao}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
      )
      .toSorted(
        (left, right) =>
          new Date(right.dataRealizacao).getTime() - new Date(left.dataRealizacao).getTime(),
      );
    const response: PagedWorkshops = {
      items: matching.slice(offset, offset + limit).map(summaryFor),
      totalItems: matching.length,
      offset,
      limit,
    };
    return HttpResponse.json(response);
  }),

  http.get("*/api/workshops/:id", ({ params, request }) => {
    const workshop = findMockWorkshop(Number(params.id));
    if (!workshop || (workshop.status === "archived" && !isMockAuthorized(request))) {
      return problemResponse(404, "workshop_not_found", "Workshop não encontrado");
    }
    const participantes = activeParticipantsFor(workshop);
    return HttpResponse.json({
      ...workshop,
      participantCount: participantes.length,
      participantes,
      archiveEvents: isMockAuthorized(request) ? workshop.archiveEvents : [],
    });
  }),

  http.post("*/api/workshops", async ({ request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const input = (await request.json()) as CreateWorkshopRequest;
    const invalid = validateInput(input);
    if (invalid) return invalid;

    if (input.substituiWorkshopId) {
      const predecessor = findMockWorkshop(input.substituiWorkshopId);
      const event = predecessor?.archiveEvents.findLast(({ restoredAt }) => !restoredAt);
      const validReplacement =
        predecessor?.status === "archived" &&
        event?.reason === "replacement" &&
        !event.replacementWorkshopId &&
        quarterKey(predecessor.dataRealizacao) === quarterKey(input.dataRealizacao);
      if (!validReplacement) {
        return problemResponse(409, "invalid_replacement", "Workshop substituído inválido");
      }
    }

    const workshop = createMockWorkshop(input);
    return HttpResponse.json(workshop, {
      status: 201,
      headers: { Location: `/api/workshops/${workshop.id}` },
    });
  }),

  http.put("*/api/workshops/:id", async ({ params, request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const workshop = findMockWorkshop(Number(params.id));
    if (!workshop) return problemResponse(404, "workshop_not_found", "Workshop não encontrado");
    const input = (await request.json()) as WorkshopInput;
    const invalid = validateInput(input, workshop.id);
    if (invalid) return invalid;
    return HttpResponse.json(updateMockWorkshop(workshop, input));
  }),

  http.delete("*/api/workshops/:id", async ({ params, request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const workshop = findMockWorkshop(Number(params.id));
    if (!workshop) return problemResponse(404, "workshop_not_found", "Workshop não encontrado");
    const body = (await request.json()) as { reason?: ArchiveReason };
    if (body.reason !== "manual" && body.reason !== "replacement") {
      return problemResponse(400, "validation_error", "Informe o motivo do arquivamento");
    }
    archiveMockWorkshop(workshop, body.reason);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/workshops/:id/restaurar", ({ params, request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const workshop = findMockWorkshop(Number(params.id));
    if (!workshop) return problemResponse(404, "workshop_not_found", "Workshop não encontrado");
    const conflict = listMockWorkshops().some(
      (candidate) =>
        candidate.status === "active" &&
        candidate.id !== workshop.id &&
        quarterKey(candidate.dataRealizacao) === quarterKey(workshop.dataRealizacao),
    );
    if (conflict) {
      return problemResponse(409, "quarter_conflict", "Já existe um workshop ativo neste trimestre");
    }
    return HttpResponse.json(restoreMockWorkshop(workshop));
  }),
];
