import { useState } from 'react'

export const NewsletterForm = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email) return
    setStatus('subscribed')
    setEmail('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-slate-900 text-white p-6 flex flex-col gap-4"
      aria-label="Subscribe to newsletter"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-200">Stay in sync</p>
        <h3 className="text-2xl font-semibold">Subscribe to product drops</h3>
        <p className="text-sm text-slate-200">
          Weekly round-ups on new bank connectors, compliance updates, and UX enhancements.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        Email address
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@domain.com"
          data-testid="newsletter-email"
          className="rounded-full px-4 py-2 text-slate-900"
        />
      </label>
      <button
        type="submit"
        className="inline-flex justify-center items-center gap-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
      >
        Subscribe
      </button>
      {status === 'subscribed' && (
        <p className="text-sm text-emerald-300">Subscribed! Check your inbox for confirmation.</p>
      )}
    </form>
  )
}


