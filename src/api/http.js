const DEFAULT_BASE = 'http://localhost:5230'

const normalizeBase = (base) => {
  if (!base) return DEFAULT_BASE
  return base.endsWith('/') ? base.slice(0, -1) : base
}

const API_BASE = `${normalizeBase(import.meta.env.VITE_API_URL)}/api`

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const buildUrl = (endpoint, params) => {
  const url = new URL(
    endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  )

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      url.searchParams.append(key, value)
    })
  }
  return url.toString()
}

export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    token,
    params,
    headers = {},
    signal,
    skipJson
  } = options

  const url = buildUrl(endpoint, params)

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    signal
  })

  if (!response.ok) {
    let errorPayload = null
    try {
      errorPayload = await response.json()
    } catch {
      // ignore
    }
    const message =
      errorPayload?.message ||
      errorPayload?.title ||
      `${response.status} ${response.statusText}`
    throw new ApiError(message, response.status, errorPayload)
  }

  if (response.status === 204 || skipJson) {
    return null
  }

  return response.json()
}

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.append(key, value)
  })
  return searchParams.toString()
}


