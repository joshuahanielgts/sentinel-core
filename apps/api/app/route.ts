import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Root URL — there is no HTML app; all endpoints live under /api/*.
 * Browsers opening the deployment URL get a JSON hint instead of Vercel 404.
 */
export async function GET() {
	return NextResponse.json({
		service: 'sentinel-api',
		status: 'ok',
		message: 'Sentinel AI API. Use paths under /api (e.g. GET /api/workspaces with Authorization).',
		health: '/api/health',
	})
}
