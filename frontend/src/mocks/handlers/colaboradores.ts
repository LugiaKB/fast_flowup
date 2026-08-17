import { http, HttpResponse } from "msw";

import type { components } from "@/lib/api/schema";

import {
  archiveMockColaborador,
  createMockColaborador,
  findMockColaborador,
  listMockColaboradores,
  restoreMockColaborador,
  updateMockColaborador,
} from "../data/colaboradores";
import { isMockAuthorized } from "./auth";

type ColaboradorInput = components["schemas"]["ColaboradorInput"];
type PagedColaboradores = components["schemas"]["PagedColaboradores"];
type ProblemDetails = components["schemas"]["ProblemDetails"];
type RecordStatusFilter = components["parameters"]["Status"];

function problem(status: number, code: string, title: string): ProblemDetails {
  return { type: "about:blank", title, status, code };
}

function problemResponse(status: number, code: string, title: string) {
  return HttpResponse.json(problem(status, code, title), {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });
}

function validationResponse(errors: Record<string, string[]>) {
  const payload: ProblemDetails = {
    type: "https://workshops.fast/problems/validation",
    title: "Um ou mais campos são inválidos",
    status: 400,
    code: "validation_error",
    errors,
  };
  return HttpResponse.json(payload, {
    status: 400,
    headers: { "Content-Type": "application/problem+json" },
  });
}

function parseInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function validatedName(
  input: Partial<ColaboradorInput>,
): { valid: true; nome: string } | { valid: false; error: string } {
  const nome = typeof input.nome === "string" ? input.nome.trim() : "";
  if (!nome) return { valid: false, error: "Informe o nome do colaborador." };
  if (nome.length > 160) {
    return { valid: false, error: "O nome deve ter no máximo 160 caracteres." };
  }
  return { valid: true, nome };
}

function requireAuthorization(request: Request) {
  return isMockAuthorized(request)
    ? undefined
    : problemResponse(401, "unauthorized", "Autenticação administrativa necessária");
}

export const colaboradoresHandlers = [
  http.get("*/api/colaboradores", ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get("query") ?? "").trim();
    const offset = parseInteger(url.searchParams.get("offset"), 0);
    const limit = parseInteger(url.searchParams.get("limit"), 20);
    const status = (url.searchParams.get("status") ?? "active") as RecordStatusFilter;
    const errors: Record<string, string[]> = {};

    if (query.length > 200) errors.query = ["A busca deve ter no máximo 200 caracteres."];
    if (!Number.isInteger(offset) || offset < 0) {
      errors.offset = ["O deslocamento deve ser zero ou positivo."];
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.limit = ["O limite deve estar entre 1 e 100."];
    }
    if (!(["active", "archived", "all"] as string[]).includes(status)) {
      errors.status = ["O status deve ser active, archived ou all."];
    }

    if (Object.keys(errors).length > 0) return validationResponse(errors);
    if (status !== "active") {
      const unauthorized = requireAuthorization(request);
      if (unauthorized) return unauthorized;
    }

    const normalizedQuery = query.toLocaleLowerCase("pt-BR");
    const matching = listMockColaboradores()
      .filter((record) => status === "all" || record.status === status)
      .filter(({ nome }) => nome.toLocaleLowerCase("pt-BR").includes(normalizedQuery))
      .toSorted((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
    const response: PagedColaboradores = {
      items: matching.slice(offset, offset + limit),
      totalItems: matching.length,
      offset,
      limit,
    };

    return HttpResponse.json(response);
  }),

  http.get("*/api/colaboradores/:id", ({ params, request }) => {
    const record = findMockColaborador(Number(params.id));
    if (!record || (record.status === "archived" && !isMockAuthorized(request))) {
      return problemResponse(404, "colaborador_not_found", "Colaborador não encontrado");
    }
    return HttpResponse.json(record);
  }),

  http.post("*/api/colaboradores", async ({ request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;

    const result = validatedName((await request.json()) as Partial<ColaboradorInput>);
    if (!result.valid) return validationResponse({ nome: [result.error] });

    const record = createMockColaborador(result.nome);
    return HttpResponse.json(record, {
      status: 201,
      headers: { Location: `/api/colaboradores/${record.id}` },
    });
  }),

  http.put("*/api/colaboradores/:id", async ({ params, request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const record = findMockColaborador(Number(params.id));
    if (!record) return problemResponse(404, "colaborador_not_found", "Colaborador não encontrado");

    const result = validatedName((await request.json()) as Partial<ColaboradorInput>);
    if (!result.valid) return validationResponse({ nome: [result.error] });
    return HttpResponse.json(updateMockColaborador(record, result.nome));
  }),

  http.delete("*/api/colaboradores/:id", ({ params, request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const record = findMockColaborador(Number(params.id));
    if (!record) return problemResponse(404, "colaborador_not_found", "Colaborador não encontrado");

    archiveMockColaborador(record);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/colaboradores/:id/restaurar", ({ params, request }) => {
    const unauthorized = requireAuthorization(request);
    if (unauthorized) return unauthorized;
    const record = findMockColaborador(Number(params.id));
    if (!record) return problemResponse(404, "colaborador_not_found", "Colaborador não encontrado");

    return HttpResponse.json(restoreMockColaborador(record));
  }),
];
