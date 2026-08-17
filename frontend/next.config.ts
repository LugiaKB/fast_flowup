import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "api",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  },
  experimental: {
    // The CLI checker loses very short child-process output in this sandbox.
    // TypeScript 5.9 still provides the stable compiler API used here.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
