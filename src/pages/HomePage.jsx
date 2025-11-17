import { FiActivity, FiClock, FiGrid, FiShield } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBankingData } from '../context/BankingDataContext'
import { StatCard } from '../components/ui/StatCard'
import { formatCurrency } from '../utils/formatters'

const normalizeAccount = (account) => ({
  accountId: account.accountId ?? account.AccountId,
  ownerId: account.userId ?? account.UserId,
  balance: account.balance ?? account.Balance ?? 0
})

const normalizeTransaction = (transaction) => {
  const rawType = transaction.transactionType ?? transaction.TransactionType ?? ''
  return {
    id: transaction.transactionId ?? transaction.TransactionId,
    description: transaction.description ?? transaction.Description ?? '',
    type: rawType.toLowerCase(),
    label: rawType,
    amount: transaction.amount ?? transaction.Amount ?? 0
  }
}

export const HomePage = () => {
  const { user, isSysAdmin } = useAuth()
  const { accounts, transactions } = useBankingData()

  const mappedAccounts = accounts.map(normalizeAccount)
  const userAccounts = isSysAdmin
    ? mappedAccounts
    : mappedAccounts.filter((account) => account.ownerId === user?.id)

  const balanceTotal = userAccounts.reduce((total, account) => total + Number(account.balance || 0), 0)
  const recentTransactions = transactions.slice(0, 5).map(normalizeTransaction)

  return (
    <section className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-br from-brand-500 to-slate-900 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-100">Portfolio overview</p>
        <h1 className="text-3xl font-semibold">
          {user ? `Welcome ${user.fullName || user.email}` : 'Welcome to Banking Aggregator'}
        </h1>
        <p className="text-sm text-brand-100 max-w-2xl">
          Monitor deposits, withdrawals, and treasury movements across every connected bank. This
          workspace centralizes compliance-ready data, recent activity, and shortcuts to key actions.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(balanceTotal)}
          helper="Across all linked accounts"
          icon={<FiGrid />}
        />
        <StatCard
          label="Active Accounts"
          value={userAccounts.length}
          helper="Includes checking, savings, cards"
          icon={<FiActivity />}
        />
        <StatCard
          label="Recent Transactions"
          value={recentTransactions.length}
          helper="Past 7 items"
          icon={<FiClock />}
        />
        <StatCard
          label="Security Tier"
          value={isSysAdmin ? 'Sysadmin' : 'User'}
          helper="Refresh & verify controls ready"
          icon={<FiShield />}
        />
      </div>
      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <p className="text-sm text-slate-500">
            Launch deposits, withdrawals, transfers, or admin approvals without leaving the dashboard.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: 'View Accounts', to: '/accounts' },
              { label: 'Transactions History', to: '/transactions' },
              ...(isSysAdmin
                ? [
                    { label: 'Manage Users', to: '/admin/users' },
                    { label: 'Manage Banks', to: '/admin/banks' }
                  ]
                : [])
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-600"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
          <ul className="mt-4 space-y-3">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between text-sm text-slate-600"
              >
                <div>
                  <p className="font-medium text-slate-900">{transaction.description}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {transaction.label}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type.includes('withdraw') || transaction.type.includes('out')
                      ? 'text-rose-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {transaction.type.includes('withdraw') || transaction.type.includes('out')
                    ? '-'
                    : '+'}
                  {formatCurrency(transaction.amount)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  )
}

