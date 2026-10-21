const BASE_URL = import.meta.env.VITE_API_URL

function createHeaders(init: RequestInit = {}): Headers {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: createHeaders(init),
  })

  if (!res.ok) {
    throw new Error((await res.text()) || res.statusText)
  }

  return res.json() as Promise<T>
}

export function apiError(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : ''
  try {
    const body = JSON.parse(raw) as { message?: unknown }
    if (typeof body.message === 'string' && body.message) return body.message
  } catch {
    // відповідь не JSON
  }
  return raw || fallback
}
