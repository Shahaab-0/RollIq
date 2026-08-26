import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pins the workspace root explicitly -- without this, Turbopack walks up
  // looking for a lockfile and finds an unrelated package-lock.json outside
  // this git repo (a stray one under the user's home directory), which it
  // then correctly ignores but warns about on every build.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
