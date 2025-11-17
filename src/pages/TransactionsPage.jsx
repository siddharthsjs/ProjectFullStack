import { useMemo, useState } from 'react'
import { useBankingData } from '../context/BankingDataContext'
import { DataGrid } from '../components/ui/DataGrid'
import { formatCurrency, formatDate } from '../utils/formatters'

const normalizeTransaction = (transaction) => ({
  id: transaction.transactionId ?? transaction.TransactionId,
  accountNumber: transaction.accountNumber ?? transaction.AccountNumber ?? 'Hidden',
  transactionType: transaction.transactionType ?? transaction.TransactionType ?? 'Transaction',
  amount: Number(transaction.amount ?? transaction.Amount ?? 0),
  balanceAfter: Number(transaction.balanceAfter ?? transaction.BalanceAfter ?? 0),
  toAccountId: transaction.toAccountId ?? transaction.ToAccountId ?? null,
  description: transaction.description ?? transaction.Description ?? '',
  transactionDate: transaction.transactionDate ?? transaction.TransactionDate,
  initiatedBy: transaction.initiatedBy ?? transaction.InitiatedBy ?? 'Self'
})

export const TransactionsPage = () => {
  const { transactions } = useBankingData()
  const [filters, setFilters] = useState({
    type: 'all',
    fromDate: '',
    toDate: ''
  })

  const rows = useMemo(
    () => transactions.map(normalizeTransaction),
    [transactions]
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filters.type !== 'all' && row.transactionType !== filters.type) {
        return false
      }
      if (filters.fromDate && new Date(row.transactionDate) < new Date(filters.fromDate)) {
        return false
      }
      if (filters.toDate && new Date(row.transactionDate) > new Date(filters.toDate)) {
        return false
      }
      return true
    })
  }, [rows, filters])

  const columns = [
    {
      id: 'transactionDate',
      label: 'Date',
      accessor: (row) => row.transactionDate,
      render: (row) => formatDate(row.transactionDate)
    },
    { id: 'accountNumber', label: 'Account', accessor: (row) => row.accountNumber },
    { id: 'transactionType', label: 'Type', accessor: (row) => row.transactionType },
    {
      id: 'amount',
      label: 'Amount',
      accessor: (row) => row.amount,
      render: (row) => formatCurrency(row.amount)
    },
    {
      id: 'balanceAfter',
      label: 'Balance',
      accessor: (row) => row.balanceAfter,
      render: (row) => formatCurrency(row.balanceAfter)
    },
    {
      id: 'toAccountId',
      label: 'Counterparty',
      accessor: (row) => row.toAccountId ?? '—'
    },
    { id: 'initiatedBy', label: 'Initiated by', accessor: (row) => row.initiatedBy }
  ]

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Transactions</p>
        <h1 className="text-3xl font-semibold text-slate-900">Paginated, searchable history</h1>
        <p className="text-sm text-slate-500">
          Powered by `/api/Transactions/my-transactions` with filters for date range and typeahead search.
        </p>
      </header>
      <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">
          Type
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer In">Transfer In</option>
            <option value="Transfer Out">Transfer Out</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          From date
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          To date
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() =>
              setFilters({
                type: 'all',
                fromDate: '',
                toDate: ''
              })
            }
            className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            Reset filters
          </button>
        </div>
      </div>
      <DataGrid
        title="Transactions"
        columns={columns}
        rows={filteredRows}
        searchPlaceholder="Search transactions"
      />
    </section>
  )
}


