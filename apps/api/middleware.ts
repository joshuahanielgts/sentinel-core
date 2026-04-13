import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const configuredOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
  const allowedOrigins = new Set([configuredOrigin, 'http://localhost:5173'])
  const requestOrigin = request.headers.get('origin') || ''
  const allowOrigin = allowedOrigins.has(requestOrigin) ? requestOrigin : configuredOrigin

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    })
  }

  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', allowOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Vary', 'Origin')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
