import { useState } from 'react'

const defaultForm = {
  fullname: '',
  email: '',
  topic: 'support',
  message: ''
}

export const ContactForm = () => {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState('idle')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus('submitting')
    setTimeout(() => {
      setStatus('success')
      setForm(defaultForm)
    }, 600)
  }

  return (
    <form
      className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2"
      onSubmit={handleSubmit}
      data-testid="contact-form"
    >
      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold text-slate-900">Contact sales & support</h3>
        <p className="text-sm text-slate-500">
          We respond within one business day and include audit-ready transcripts.
        </p>
      </div>
      <label className="text-sm font-medium text-slate-700">
        Full name
        <input
          type="text"
          name="fullname"
          required
          value={form.fullname}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Topic
        <select
          name="topic"
          value={form.topic}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="support">Support</option>
          <option value="security">Security review</option>
          <option value="billing">Billing</option>
          <option value="partnerships">Partnerships</option>
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700 md:col-span-2">
        Message
        <textarea
          name="message"
          required
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <div className="md:col-span-2 flex flex-col gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Send message
        </button>
        {status === 'success' && (
          <p className="text-sm text-emerald-600">Thanks! We will reply shortly.</p>
        )}
      </div>
    </form>
  )
}


