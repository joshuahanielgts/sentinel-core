import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function badRequest(message: string, code?: string) {
  return new AppError(message, 400, code)
}

export function unauthorized(message = 'Unauthorized') {
  return new AppError(message, 401, 'UNAUTHORIZED')
}

export function forbidden(message = 'Forbidden') {
  return new AppError(message, 403, 'FORBIDDEN')
}

export function notFound(message = 'Not found') {
  return new AppError(message, 404, 'NOT_FOUND')
}

export function internal(message = 'Internal server error') {
  return new AppError(message, 500, 'INTERNAL')
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const supaError = error as { message: string; hint?: string; code?: string }
    console.error('Supabase/DB error:', supaError.message, supaError.hint ?? '')

    if (supaError.message?.includes('Invalid API key')) {
      return NextResponse.json(
        { error: 'Server configuration error: invalid Supabase API key. Check your .env.local file.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: supaError.message },
      { status: 500 }
    )
  }

  console.error('Unhandled error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
