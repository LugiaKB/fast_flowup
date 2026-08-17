export type ApiMode = "api" | "mock";

export interface ApiRuntimeConfig {
  baseUrl: string;
  mode: ApiMode;
}

export function getApiRuntimeConfig(): ApiRuntimeConfig {
  return {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
    mode: process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "api",
  };
}
