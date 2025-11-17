import { useCallback } from 'react'
import { apiRequest, ApiError } from '../api/http'
import { useAuth } from '../context/AuthContext'

export const useApi = () => {
  const { session, refreshSession } = useAuth()

  const call = useCallback(
    async (endpoint, options = {}) => {
      const token = options?.token ?? session?.tokens?.accessToken
      try {
        return await apiRequest(endpoint, { ...options, token })
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          session?.tokens?.refreshToken
        ) {
          const refreshed = await refreshSession()
          if (refreshed?.tokens?.accessToken) {
            return apiRequest(endpoint, {
              ...options,
              token: refreshed.tokens.accessToken
            })
          }
        }
        throw error
      }
    },
    [session, refreshSession]
  )

  const get = useCallback(
    (endpoint, options) => call(endpoint, { ...options, method: 'GET' }),
    [call]
  )

  const post = useCallback(
    (endpoint, body, options) =>
      call(endpoint, { ...options, method: 'POST', body }),
    [call]
  )

  const put = useCallback(
    (endpoint, body, options) =>
      call(endpoint, { ...options, method: 'PUT', body }),
    [call]
  )

  const del = useCallback(
    (endpoint, options) => call(endpoint, { ...options, method: 'DELETE' }),
    [call]
  )

  return { get, post, put, del, call }
}


