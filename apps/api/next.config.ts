import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.resolve(__dirname, '../..'),
	// API-only repo has no eslint installed; Vercel runs `next build` which would fail lint step
	eslint: {
		ignoreDuringBuilds: true,
	},
}

export default nextConfig
