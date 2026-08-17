import { http, HttpResponse } from "msw";

import type { components } from "@/lib/api/schema";

import { colaboradoresFixture } from "../fixtures";

type PagedColaboradores = components["schemas"]["PagedColaboradores"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

function validationProblem(errors: Record<string, string[]>): ProblemDetails {
  return {
    type: "https://workshops.fast/problems/validation",
    title: "Um ou mais parâmetros são inválidos",
    status: 400,
    code: "validation_error",
    errors,
  };
}

function parseInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export const colaboradoresHandlers = [
  http.get("*/api/colaboradores", ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get("query") ?? "").trim();
    const offset = parseInteger(url.searchParams.get("offset"), 0);
    const limit = parseInteger(url.searchParams.get("limit"), 20);
    const errors: Record<string, string[]> = {};

    if (query.length > 200) errors.query = ["A busca deve ter no máximo 200 caracteres."];
    if (!Number.isInteger(offset) || offset < 0) {
      errors.offset = ["O deslocamento deve ser zero ou positivo."];
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.limit = ["O limite deve estar entre 1 e 100."];
    }

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(validationProblem(errors), {
        status: 400,
        headers: { "Content-Type": "application/problem+json" },
      });
    }

    const normalizedQuery = query.toLocaleLowerCase("pt-BR");
    const matching = colaboradoresFixture
      .filter(({ status }) => status === "active")
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
];
