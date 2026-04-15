import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
	// API-only repo has no eslint installed; Vercel runs `next build` which would fail lint step
	eslint: {
		ignoreDuringBuilds: true,
	},
}

// Monorepo: two lockfiles (root + apps/api). Pin tracing root so builds are deterministic.
if (process.env.VERCEL === '1') {
	nextConfig.outputFileTracingRoot = path.resolve(__dirname)
} else {
	nextConfig.outputFileTracingRoot = path.resolve(__dirname, '../..')
}

export default nextConfig
