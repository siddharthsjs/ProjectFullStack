import { galleryProfiles } from '../data/mockData'

export const AboutPage = () => (
  <section className="space-y-10">
    <header className="rounded-3xl bg-white p-8 shadow-md">
      <p className="text-xs uppercase tracking-[0.5em] text-brand-500">About Banking Aggregator</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">Bank orchestration for every client</h1>
      <p className="mt-4 text-slate-600">
        Banking Aggregator unifies retail, wealth, and treasury accounts so relationship managers,
        finance teams, and customers see the same balances, approvals, and alerts in real time.
      </p>
    </header>
    <section className="grid gap-6 md:grid-cols-3">
      {[
        {
          title: 'Security first',
          description: 'Step-up verification, session refresh, and audit-ready entitlement trails.'
        },
        {
          title: 'Operational intelligence',
          description: 'Cash positions, branch exposure, and capital flows streamed to one workspace.'
        },
        {
          title: 'Client focus',
          description: 'Personalized journeys for households, advisors, and sysadmins with responsive UX.'
        }
      ].map((card) => (
        <article
          key={card.title}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-2"
        >
          <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
          <p className="text-sm text-slate-600">{card.description}</p>
        </article>
      ))}
    </section>
    <section>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-500">Our team</p>
          <h2 className="text-2xl font-semibold text-slate-900">Profiles & image gallery</h2>
          <p className="text-sm text-slate-500">
            Meet the team aligning compliance, product, and service to deliver trusted banking tools.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        {galleryProfiles.map((profile) => (
          <article
            key={profile.id}
            className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col"
          >
            <img
              src={profile.image}
              alt={profile.name}
              className="h-48 w-full object-cover"
              loading="lazy"
            />
            <div className="p-5 flex flex-col gap-1 flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{profile.name}</h3>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-500">{profile.title}</p>
              <p className="text-sm text-slate-600 flex-1">{profile.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  </section>
)

