import type { NextConfig } from "next";

const apiMode = process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "api";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

if (process.env.NODE_ENV === "production" && apiMode === "mock") {
  throw new Error("NEXT_PUBLIC_API_MODE=mock não é permitido em builds de produção.");
}
if (apiMode === "api" && !apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL é obrigatória no modo api.");
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_MODE: apiMode,
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  experimental: {
    // The CLI checker loses very short child-process output in this sandbox.
    // TypeScript 5.9 still provides the stable compiler API used here.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
