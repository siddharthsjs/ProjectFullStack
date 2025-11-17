import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiCheck } from 'react-icons/fi'

export const LandingPage = () => {
  const [cards, setCards] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const abort = new AbortController()
    fetch('https://dummyjson.com/products?limit=3', { signal: abort.signal })
      .then((response) => response.json())
      .then((data) => {
        setCards(
          data.products.map((product) => ({
            id: product.id,
            title: product.title,
            description: `Monitor ${product.title.toLowerCase()} performance, fraud alerts, and liquidity.`,
            badge: `${product.stock}+ signals`
          }))
        )
        setStatus('success')
      })
      .catch(() => {
        setCards([
          {
            id: 'fallback-1',
            title: 'Realtime bank sync',
            description: 'Direct connections to retail, commercial, and treasury institutions.',
            badge: 'Always on'
          },
          {
            id: 'fallback-2',
            title: 'Cross-bank analytics',
            description: 'Centralize deposits, transactions, and treasury alerts.',
            badge: 'Analytics'
          },
          {
            id: 'fallback-3',
            title: 'Enterprise-grade security',
            description: 'SSO, SCIM provisioning, and continuous verification.',
            badge: 'Zero trust'
          }
        ])
        setStatus('error')
      })
    return () => abort.abort()
  }, [])

  return (
    <section className="space-y-8">
      <header className="grid gap-6 rounded-3xl bg-white p-8 shadow-lg lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Banking aggregator</p>
          <h1 className="text-4xl font-semibold text-slate-900">
            All of your bank accounts in one personal control center.
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Link every institution, automate refreshes, and act on deposits, withdrawals, transfers,
            user onboarding, and branch governance from one secure surface.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Launch app
            </Link>
            <Link
              to="/plans"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              View plans
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.5em] text-brand-200">Bank operations</p>
          <h2 className="text-2xl font-semibold">One hub for treasury, retail, and admin teams</h2>
          <p className="text-sm text-slate-200">
            Provide executives and branch teams with a consistent view of balances, approvals, and
            compliance attestations on mobile, tablet, or desktop.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            {[
              'Single sign-on with step-up verification',
              'Automated refresh + manual override controls',
              'Audit trails for every deposit or user change'
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <FiCheck className="text-brand-300" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-3"
          >
            <span className="text-xs uppercase tracking-[0.4em] text-brand-500">
              {card.badge}
            </span>
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-600 flex-1">{card.description}</p>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
              Explore
              <FiArrowUpRight />
            </button>
          </article>
        ))}
      </section>
      {status === 'loading' && (
        <p className="text-sm text-slate-500" role="status">
          Loading insight cards...
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-rose-500" role="alert">
          API temporarily unavailable. Showing curated cards instead.
        </p>
      )}
    </section>
  )
}

