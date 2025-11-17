import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, ApiError } from '../api/http'

const STORAGE_KEY = 'flux-banking:session'

const AuthContext = createContext({
  session: null,
  user: null,
  status: 'idle',
  lastVerified: null,
  error: null,
  isAuthenticated: false,
  isSysAdmin: false,
  login: async () => {},
  logout: () => {},
  refreshSession: async () => {},
  verifySession: async () => {},
  clearError: () => {}
})

const loadSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(loadSession)
  const [status, setStatus] = useState(session ? 'authenticated' : 'idle')
  const [lastVerified, setLastVerified] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  const login = async ({ email, password }) => {
    setStatus('authenticating')
    setError(null)
    try {
      const payload = await apiRequest('/Auth/login', {
        method: 'POST',
        body: { email, password }
      })

      const nextSession = {
        user: {
          id: payload.userId,
          email: payload.email,
          fullName: payload.fullName,
          roles: payload.roles ?? []
        },
        tokens: {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken
        },
        expiresAt: Date.now() + payload.expiresIn * 1000
      }
      setSession(nextSession)
      setStatus('authenticated')
      setLastVerified(new Date().toISOString())
      return nextSession
    } catch (err) {
      setStatus('error')
      setError(err.message ?? 'Unable to login')
      throw err
    }
  }

  const logout = async () => {
    if (session?.tokens?.accessToken) {
      try {
        await apiRequest('/Auth/logout', {
          method: 'POST',
          token: session.tokens.accessToken
        })
      } catch {
        // ignore logout failures
      }
    }
    setSession(null)
    setStatus('idle')
    setLastVerified(null)
  }

  const refreshSession = async () => {
    if (!session?.tokens?.refreshToken || !session?.tokens?.accessToken) {
      return null
    }
    setStatus('refreshing')
    try {
      const payload = await apiRequest('/Auth/refresh', {
        method: 'POST',
        body: {
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken
        }
      })
      const nextSession = {
        ...session,
        tokens: {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken
        },
        expiresAt: Date.now() + payload.expiresIn * 1000
      }
      setSession(nextSession)
      setStatus('authenticated')
      setLastVerified(new Date().toISOString())
      return nextSession
    } catch (err) {
      setStatus('error')
      setError(err.message ?? 'Unable to refresh session')
      await logout()
      throw err
    }
  }

  const verifySession = async () => {
    if (!session?.tokens?.accessToken) {
      return { valid: false }
    }
    try {
      const payload = await apiRequest('/Auth/verify', {
        method: 'GET',
        token: session.tokens.accessToken
      })
      const updated = {
        ...session,
        user: {
          id: payload.userId,
          email: payload.email,
          fullName: payload.fullName,
          roles: payload.roles ?? [],
          userType: payload.userType
        }
      }
      setSession(updated)
      const timestamp = new Date().toISOString()
      setLastVerified(timestamp)
      return { valid: payload.valid, timestamp }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await logout()
      }
      setError(err.message ?? 'Unable to verify session')
      return { valid: false }
    }
  }

  const clearError = () => setError(null)

  const value = {
    session,
    user: session?.user ?? null,
    status,
    lastVerified,
    error,
    isAuthenticated: Boolean(session?.tokens?.accessToken),
    isSysAdmin: Boolean(
      session?.user?.roles?.some((role) =>
        ['Admin', 'Sysadmin', 'SysAdmin'].includes(role)
      )
    ),
    login,
    logout,
    refreshSession,
    verifySession,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

