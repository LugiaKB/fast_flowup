import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The CLI checker loses very short child-process output in this sandbox.
    // TypeScript 5.9 still provides the stable compiler API used here.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
