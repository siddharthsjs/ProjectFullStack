import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, status, user } = useAuth()

  if (status === 'authenticating' || status === 'refreshing') {
    return (
      <section className="py-20 text-center text-slate-500">
        Checking your banking workspace...
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user?.roles?.some((role) => allowedRoles.includes(role))
    if (!hasRole) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

