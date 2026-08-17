export type ApiMode = "api" | "mock";

export interface ApiRuntimeConfig {
  baseUrl: string;
  mode: ApiMode;
}

export function getApiRuntimeConfig(): ApiRuntimeConfig {
  const requestedMode = process.env.NEXT_PUBLIC_API_MODE;
  const mode: ApiMode = process.env.NODE_ENV === "production"
    ? "api"
    : requestedMode === "mock" ? "mock" : "api";
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  if (mode === "api") {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL é obrigatória no modo api.");
    const url = new URL(baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_API_URL deve usar HTTP ou HTTPS.");
    }
  }

  return { baseUrl, mode };
}
