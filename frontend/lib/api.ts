/**
 * API Client for backend Express server
 * Handles all API calls to the backend with proper credentials and error handling
 */

const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000/api'

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Fetch wrapper that includes credentials (cookies) and handles errors
 */
export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { params, ...fetchOptions } = options

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })
    url += `?${searchParams.toString()}`
  }

  // Ensure credentials are included for cookies
  const finalOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  }

  // Remove Content-Type for FormData
  if (fetchOptions.body instanceof FormData) {
    delete (finalOptions.headers as Record<string, string>)['Content-Type']
  }

  const response = await fetch(url, finalOptions)
  
  // Handle non-JSON responses
  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return response
  }

  const data = await response.json()

  if (!response.ok) {
  const error = new Error(
    data.message || data.error || `Request failed with status ${response.status}`
  ) as any

  error.status = response.status
  error.details = data

  throw error
}


  return data
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
  return apiFetch(endpoint, {
    method: 'GET',
    ...(params ? { params } : {}),
  })
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiFetch(endpoint, {
    method: 'POST',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}



/**
 * PUT request helper
 */
export async function apiPut<T = any>(endpoint: string, body?: any): Promise<T> {
  return apiFetch(endpoint, {
    method: 'PUT',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiFetch(endpoint, { method: 'DELETE' })
}

/**
 * Upload file helper (for FormData)
 */
export async function apiUpload<T = any>(endpoint: string, formData: FormData): Promise<T> {
  return apiFetch(endpoint, {
    method: 'POST',
    body: formData,
  })
}
