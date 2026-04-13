import { supabase } from '@/lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BASE_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE.replace(/\/+$/, '')}/api`;

if (!import.meta.env.VITE_API_URL) {
  console.warn('Missing VITE_API_URL environment variable. Falling back to http://localhost:3001.');
}

async function handleUnauthorized() {
  await supabase.auth.signOut();
  window.location.href = '/login';
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  return headers;
}

function formatFetchError(err: unknown): never {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    throw new Error(
      'Cannot reach the Sentinel AI server. Please check your connection or try again shortly.'
    );
  }
  throw err;
}

async function request(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${BASE_URL}${path}`, init);
  } catch (err) {
    formatFetchError(err);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  let json: unknown;
  try { json = await response.json(); }
  catch { throw new Error(`HTTP ${response.status}: empty response`); }
  if (!response.ok) {
    const err = json as { error?: string };
    if (response.status === 401) {
      await handleUnauthorized();
    }
    throw new Error(err.error ?? `HTTP ${response.status}`);
  }
  return (json as { data: T }).data;
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await request(path, { headers });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await request(path, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await request(path, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await request(path, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async stream(path: string, body: unknown): Promise<Response> {
    const headers = await getAuthHeaders();
    const response = await request(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      if (response.status === 401) {
        await handleUnauthorized();
      }
      throw new Error(err.error || `Stream failed: ${response.status}`);
    }
    return response;
  },
};
