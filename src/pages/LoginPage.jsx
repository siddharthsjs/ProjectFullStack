import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const LoginPage = () => {
  const { login, status, error, isAuthenticated, clearError } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [localError, setLocalError] = useState(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setLocalError(null)
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      setLocalError('Email and password are required')
      return
    }
    try {
      await login(form)
      navigate('/', { replace: true })
    } catch (err) {
      setLocalError(err.message ?? 'Unable to login')
    }
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <article className="rounded-3xl bg-gradient-to-br from-brand-500 to-slate-900 p-8 text-white">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-100">Banking Aggregator</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in to view your institutions</h1>
        <p className="mt-3 text-sm text-brand-100">
          Use the credentials issued by your administrator. After signing in you&apos;ll see linked
          accounts, transactions, and—if you are a sysadmin—tools to manage users, banks, and branches.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-brand-100">
          <li>• Welcome banner greets you by name and summarizes balances</li>
          <li>• Quick links jump to deposits, withdrawals, transfers, or admin tasks</li>
          <li>• Session refresh and verify buttons keep access current</li>
        </ul>
      </article>
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl flex flex-col gap-4"
      >
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
          <p className="text-sm text-slate-500">Enter a valid banking or admin account</p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Email address
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
          disabled={status === 'authenticating'}
        >
          {status === 'authenticating' ? 'Signing in...' : 'Login'}
        </button>
        {(localError || error) && (
          <p className="text-sm text-rose-500" role="alert">
            {localError || error}
          </p>
        )}
        <p className="text-xs text-slate-400">
          Need seed users? Use the `BankCustomerAPI` seed SQL users or create a user through the
          Sysadmin portal once authenticated as Admin.
        </p>
      </form>
    </section>
  )
}

