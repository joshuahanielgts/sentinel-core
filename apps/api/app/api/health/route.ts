import { NextResponse } from 'next/server'

/** Always use this URL to verify the API is live on Vercel: GET /api/health */
export async function GET() {
	return NextResponse.json({
		ok: true,
		service: 'sentinel-api',
		timestamp: new Date().toISOString(),
	})
}
