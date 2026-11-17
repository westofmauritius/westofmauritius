import path from "node:path";
import type { NextConfig } from "next";

// This app lives in a subfolder of another repository that has its own
// lockfile. Pin the root to this folder so Next does not pick up the parent
// project's files.
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
