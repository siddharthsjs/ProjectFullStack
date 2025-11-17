import { faqItems } from '../data/mockData'
import { useState } from 'react'

export const FAQPage = () => {
  const [openItem, setOpenItem] = useState(faqItems[0]?.id)

  return (
    <section className="space-y-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-brand-500">FAQ</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Questions, answered</h1>
        <p className="mt-3 text-slate-500">
          Details about refresh cadence, MFA, and supported regions pulled from the requirements.
        </p>
      </header>
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100">
        {faqItems.map((item) => {
          const isOpen = openItem === item.id
          return (
            <article key={item.id}>
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpenItem(isOpen ? null : item.id)}
                aria-expanded={isOpen}
              >
                <span className="text-lg font-semibold text-slate-900">{item.question}</span>
                <span className="text-brand-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="px-6 pb-6 text-sm text-slate-600">{item.answer}</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}


