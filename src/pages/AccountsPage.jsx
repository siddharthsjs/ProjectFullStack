import { useMemo, useState } from 'react'
import { useBankingData } from '../context/BankingDataContext'
import { useAuth } from '../context/AuthContext'
import { DataGrid } from '../components/ui/DataGrid'
import { formatCurrency } from '../utils/formatters'

const normalizeAccount = (account) => ({
  id: account.accountId ?? account.AccountId,
  accountNumber: account.accountNumber ?? account.AccountNumber,
  accountType: account.accountType ?? account.AccountType,
  balance: Number(account.balance ?? account.Balance ?? 0),
  currencyCode: account.currencyCode ?? account.CurrencyCode ?? 'USD',
  userId: account.userId ?? account.UserId,
  userName: account.userName ?? account.UserName ?? '',
  branchName: account.branchName ?? account.BranchName ?? '',
  createdDate: account.createdDate ?? account.CreatedDate
})

export const AccountsPage = () => {
  const {
    accounts,
    branches,
    deposit,
    withdraw,
    transfer,
    createAccount,
    closeAccount,
    loading,
    error
  } = useBankingData()
  const { isSysAdmin, user } = useAuth()

  const mappedAccounts = useMemo(() => accounts.map(normalizeAccount), [accounts])
  const [transactionMode, setTransactionMode] = useState('deposit')
  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    amount: '',
    description: ''
  })
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  })
  const [createForm, setCreateForm] = useState({
    userId: '',
    branchId: '',
    accountType: 'Checking',
    currencyCode: 'USD',
    initialDeposit: ''
  })
  const [feedback, setFeedback] = useState(null)

  const columns = [
    { id: 'accountNumber', label: 'Account', accessor: (row) => row.accountNumber },
    { id: 'accountType', label: 'Type', accessor: (row) => row.accountType },
    {
      id: 'balance',
      label: 'Balance',
      accessor: (row) => row.balance,
      render: (row) => formatCurrency(row.balance, row.currencyCode)
    },
    { id: 'currencyCode', label: 'Currency', accessor: (row) => row.currencyCode },
    {
      id: 'userName',
      label: 'Owner',
      accessor: (row) => row.userName || (row.userId === user?.id ? user.fullName : '—')
    },
    { id: 'branchName', label: 'Branch', accessor: (row) => row.branchName || '—' }
  ]

  const handleTransactionChange = (event) => {
    const { name, value } = event.target
    setTransactionForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const handleTransferChange = (event) => {
    const { name, value } = event.target
    setTransferForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    setCreateForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const runTransaction = async (event) => {
    event.preventDefault()
    if (!transactionForm.accountId || !transactionForm.amount) return
    const payload = {
      accountId: Number(transactionForm.accountId),
      amount: Number(transactionForm.amount),
      description: transactionForm.description
    }
    try {
      if (transactionMode === 'deposit') {
        await deposit(payload)
        setFeedback('Deposit submitted.')
      } else {
        await withdraw(payload)
        setFeedback('Withdrawal submitted.')
      }
      setTransactionForm({ accountId: '', amount: '', description: '' })
    } catch (err) {
      setFeedback(err.message ?? 'Unable to process transaction')
    }
  }

  const runTransfer = async (event) => {
    event.preventDefault()
    if (
      !transferForm.fromAccountId ||
      !transferForm.toAccountId ||
      !transferForm.amount
    ) {
      return
    }
    try {
      await transfer({
        fromAccountId: Number(transferForm.fromAccountId),
        toAccountId: Number(transferForm.toAccountId),
        amount: Number(transferForm.amount),
        description: transferForm.description
      })
      setFeedback('Transfer completed.')
      setTransferForm({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: ''
      })
    } catch (err) {
      setFeedback(err.message ?? 'Unable to transfer funds')
    }
  }

  const handleCreateAccount = async (event) => {
    event.preventDefault()
    if (!createForm.userId || !createForm.branchId || !createForm.initialDeposit) return
    try {
      await createAccount({
        userId: Number(createForm.userId),
        branchId: Number(createForm.branchId),
        accountType: createForm.accountType,
        currencyCode: createForm.currencyCode,
        initialDeposit: Number(createForm.initialDeposit)
      })
      setFeedback('Account created.')
      setCreateForm({
        userId: '',
        branchId: '',
        accountType: 'Checking',
        currencyCode: 'USD',
        initialDeposit: ''
      })
    } catch (err) {
      setFeedback(err.message ?? 'Unable to create account')
    }
  }

  const handleCloseAccount = async (accountId) => {
    try {
      await closeAccount(accountId)
      setFeedback('Account closed.')
    } catch (err) {
      setFeedback(err.message ?? 'Unable to close account')
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Accounts</p>
        <h1 className="text-3xl font-semibold text-slate-900">List, transact, and close accounts</h1>
        <p className="text-sm text-slate-500">
          Features map to `/api/Accounts` and `/api/Transactions/*` endpoints with pagination, search,
          deposit, withdraw, transfer, and close actions.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4"
          onSubmit={runTransaction}
        >
          <div className="flex items-center gap-4">
            {['deposit', 'withdraw'].map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={transactionMode === mode}
                  onChange={() => setTransactionMode(mode)}
                />
                {mode}
              </label>
            ))}
          </div>
          <label className="text-sm font-medium text-slate-700">
            Account
            <select
              name="accountId"
              required
              value={transactionForm.accountId}
              onChange={handleTransactionChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="">Select account</option>
              {mappedAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} · {formatCurrency(account.balance, account.currencyCode)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              name="amount"
              required
              value={transactionForm.amount}
              onChange={handleTransactionChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Description
            <input
              type="text"
              name="description"
              value={transactionForm.description}
              onChange={handleTransactionChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
          >
            {transactionMode === 'deposit' ? 'Deposit funds' : 'Withdraw funds'}
          </button>
        </form>
        <form
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4"
          onSubmit={runTransfer}
        >
          <h2 className="text-lg font-semibold text-slate-900">Transfer between accounts</h2>
          <label className="text-sm font-medium text-slate-700">
            From account
            <select
              name="fromAccountId"
              required
              value={transferForm.fromAccountId}
              onChange={handleTransferChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="">Select account</option>
              {mappedAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            To account
            <select
              name="toAccountId"
              required
              value={transferForm.toAccountId}
              onChange={handleTransferChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="">Select account</option>
              {mappedAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              name="amount"
              required
              value={transferForm.amount}
              onChange={handleTransferChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Description
            <input
              type="text"
              name="description"
              value={transferForm.description}
              onChange={handleTransferChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Transfer
          </button>
        </form>
      </div>
      {isSysAdmin && (
        <form
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm grid gap-4 md:grid-cols-2"
          onSubmit={handleCreateAccount}
        >
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Create account</h2>
            <p className="text-sm text-slate-500">
              Calls the `/api/Accounts` POST endpoint (requires CreateAccount permission).
            </p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            User ID
            <input
              type="number"
              name="userId"
              required
              value={createForm.userId}
              onChange={handleCreateChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Branch
            <select
              name="branchId"
              required
              value={createForm.branchId}
              onChange={handleCreateChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.branchId ?? branch.BranchId} value={branch.branchId ?? branch.BranchId}>
                  {(branch.branchName ?? branch.BranchName) ?? 'Branch'}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Account type
            <select
              name="accountType"
              value={createForm.accountType}
              onChange={handleCreateChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit">Credit</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Currency
            <input
              type="text"
              name="currencyCode"
              value={createForm.currencyCode}
              onChange={handleCreateChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Initial deposit
            <input
              type="number"
              min="0"
              step="0.01"
              name="initialDeposit"
              required
              value={createForm.initialDeposit}
              onChange={handleCreateChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Create account
            </button>
          </div>
        </form>
      )}
      {(error || feedback) && (
        <p className={`text-sm ${error ? 'text-rose-500' : 'text-emerald-600'}`}>
          {error || feedback}
        </p>
      )}
      <DataGrid
        title="Accounts"
        columns={columns}
        rows={mappedAccounts}
        rowActions={(row) => (
          <button
            type="button"
            onClick={() => handleCloseAccount(row.id)}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600"
          >
            Close
          </button>
        )}
        disableSortColumns={[]}
      />
      {loading && <p className="text-sm text-slate-500">Syncing accounts...</p>}
    </section>
  )
}


