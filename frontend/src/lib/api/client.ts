import type { components } from "./schema";
import { getApiRuntimeConfig } from "./runtime";

export type ProblemDetails = components["schemas"]["ProblemDetails"];

type JsonBody = Record<string, unknown> | readonly unknown[];

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonBody;
  baseUrl?: string;
};

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
  }

  get status() {
    return this.problem.status;
  }
}

function isJsonBody(value: BodyInit | JsonBody): value is JsonBody {
  if (Array.isArray(value)) return true;
  if (typeof value !== "object" || value === null) return false;

  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function normalizeProblem(status: number, payload: unknown): ProblemDetails {
  if (payload && typeof payload === "object") {
    const candidate = payload as Partial<ProblemDetails>;
    if (typeof candidate.title === "string" && typeof candidate.code === "string") {
      return {
        type: typeof candidate.type === "string" ? candidate.type : "about:blank",
        title: candidate.title,
        status,
        code: candidate.code,
        detail: candidate.detail,
        instance: candidate.instance,
        traceId: candidate.traceId,
        errors: candidate.errors,
      };
    }
  }

  return {
    type: "about:blank",
    title: "Não foi possível concluir a solicitação",
    status,
    code: "unexpected_response",
  };
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  return text;
}

export async function apiRequest<T>(
  path: string,
  { body, baseUrl, headers: initialHeaders, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const runtime = getApiRuntimeConfig();
  const headers = new Headers(initialHeaders);
  headers.set("Accept", "application/json, application/problem+json");

  let requestBody = body as BodyInit | null | undefined;
  if (body !== undefined && isJsonBody(body)) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl ?? runtime.baseUrl}${path}`, {
    ...init,
    body: requestBody,
    credentials: init.credentials ?? "include",
    headers,
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    throw new ApiError(normalizeProblem(response.status, payload));
  }

  return payload as T;
}
