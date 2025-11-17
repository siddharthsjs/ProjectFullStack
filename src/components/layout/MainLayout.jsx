import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { FiBell, FiMenu, FiRefreshCcw, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { NewsletterForm } from '../forms/NewsletterForm'

const guestLinks = [
  { label: 'Home', to: '/landing' },
  { label: 'About', to: '/about' },
  { label: 'Plans', to: '/plans' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' }
]

const userLinks = [
  { label: 'Home', to: '/' },
  { label: 'Accounts', to: '/accounts' },
  { label: 'Transactions', to: '/transactions' }
]

const adminLinks = [
  { label: 'Manage Users', to: '/admin/users' },
  { label: 'Manage Banks', to: '/admin/banks' }
]

export const MainLayout = () => {
  const { user, logout, refreshSession, verifySession, status, isSysAdmin, lastVerified } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const location = useLocation()

  const navLinks = user
    ? [...userLinks, ...(isSysAdmin ? adminLinks : [])]
    : guestLinks

  const handleRefresh = async () => {
    if (user) {
      await refreshSession()
    }
  }

  const handleVerify = async () => {
    await verifySession()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-full border border-slate-200 p-2"
              onClick={() => setIsNavOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {isNavOpen ? <FiX /> : <FiMenu />}
            </button>
            <NavLink
              to={user ? '/' : '/landing'}
              className="font-display text-lg font-semibold text-slate-900"
            >
              Banking Aggregator
            </NavLink>
          </div>
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={handleRefresh}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-brand-600"
                  title="Refresh session"
                >
                  <FiRefreshCcw />
                </button>
                <button
                  onClick={handleVerify}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-brand-600"
                  title="Verify session"
                >
                  <FiBell />
                </button>
                <div className="hidden md:flex flex-col text-sm text-right">
                  <span className="font-semibold text-slate-900">
                    Welcome {user.fullName || user.email}
                  </span>
                  <span className="text-slate-500 capitalize">{status}</span>
                  {lastVerified && (
                    <span className="text-xs text-slate-400">
                      Verified {new Date(lastVerified).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
        {isNavOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsNavOpen(false)}
                className={`rounded-2xl px-4 py-3 ${
                  location.pathname === link.to
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-slate-100">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Unified oversight</p>
            <h4 className="text-2xl font-semibold text-slate-900">Banking visibility for every team</h4>
            <p className="text-sm text-slate-500">
              Manage linked institutions, approvals, and compliance alerts from any device. Adaptive
              layouts ensure the treasury desk, compliance, and executives always see the same data.
            </p>
          </div>
          <NewsletterForm />
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Banking Aggregator
        </div>
      </footer>
    </div>
  )
}

