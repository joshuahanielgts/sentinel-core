import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing VITE_API_URL environment variable')
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(body.error || `HTTP ${response.status}`)
  }
  const json = await response.json()
  return json.data
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${path}`, { headers })
    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async delete<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async stream(path: string, body: unknown): Promise<Response> {
    const headers = await getAuthHeaders()
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  },
}
