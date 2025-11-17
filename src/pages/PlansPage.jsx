import { planCatalog } from '../data/mockData'

export const PlansPage = () => (
  <section className="space-y-8">
    <header className="text-center">
      <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Plans</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Choose your orchestration tier</h1>
      <p className="mt-3 text-slate-500">
        Every plan supports multi-bank aggregation, responsive dashboards, and newsletter updates.
        Upgrade tiers to unlock more automation and governance workflows.
      </p>
    </header>
    <section className="grid gap-6 lg:grid-cols-3">
      {planCatalog.map((plan) => (
        <article
          key={plan.id}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-500">{plan.name}</p>
            <h3 className="text-xl font-semibold text-slate-900">{plan.description}</h3>
          </div>
          <div className="text-4xl font-bold text-slate-900">
            {plan.price}
            <span className="text-base font-normal text-slate-500">/{plan.cadence}</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 flex-1">
            {plan.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
          <button className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
            Select {plan.name}
          </button>
        </article>
      ))}
    </section>
  </section>
)


