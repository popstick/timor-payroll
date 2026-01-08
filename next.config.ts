import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: projectRoot,
  },
  // Prevent Next.js from inferring a higher monorepo root (e.g. due to an
  // unrelated lockfile in a parent directory), which can break Turbopack
  // module resolution in local dev.
  outputFileTracingRoot: projectRoot,
};

export default withNextIntl(nextConfig);
