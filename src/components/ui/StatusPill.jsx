const statusStyles = {
  active: 'bg-green-50 text-green-700',
  closed: 'bg-rose-50 text-rose-700',
  pending: 'bg-amber-50 text-amber-700',
  default: 'bg-slate-100 text-slate-600'
}

export const StatusPill = ({ children, status = 'default' }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.default}`}
  >
    {children}
  </span>
)


