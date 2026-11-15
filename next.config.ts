import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep satellite.js server-side only — it uses node:worker_threads (pthreads WASM)
  // which is incompatible with webpack browser bundle.
  serverExternalPackages: ["satellite.js"],
};

export default nextConfig;
