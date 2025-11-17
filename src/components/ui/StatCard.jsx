export const StatCard = ({ label, value, helper, icon }) => (
  <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
    <div className="size-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="text-sm text-slate-500">{helper}</p>}
    </div>
  </article>
)


