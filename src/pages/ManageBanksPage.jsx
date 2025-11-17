import { useMemo, useState } from 'react'
import { useBankingData } from '../context/BankingDataContext'
import { DataGrid } from '../components/ui/DataGrid'

const normalizeBank = (bank) => ({
  id: bank.bankId ?? bank.BankId,
  bankName: bank.bankName ?? bank.BankName,
  headOfficeAddress: bank.headOfficeAddress ?? bank.HeadOfficeAddress,
  ifscCode: bank.ifscCode ?? bank.IFSCCode,
  branchCount: bank.branchCount ?? bank.BranchCount ?? 0,
  createdDate: bank.createdDate ?? bank.CreatedDate
})

const normalizeBranch = (branch) => ({
  id: branch.branchId ?? branch.BranchId,
  branchName: branch.branchName ?? branch.BranchName,
  branchCode: branch.branchCode ?? branch.BranchCode,
  address: branch.address ?? branch.Address ?? '',
  bankId: branch.bankId ?? branch.BankId,
  bankName: branch.bankName ?? branch.BankName ?? '',
  managerName: branch.managerName ?? branch.ManagerName ?? ''
})

export const ManageBanksPage = () => {
  const { banks, branches, createBank, deleteBank, createBranch, deleteBranch, error } =
    useBankingData()
  const [bankForm, setBankForm] = useState({
    bankName: '',
    headOfficeAddress: '',
    ifscCode: ''
  })
  const [branchForm, setBranchForm] = useState({
    bankId: '',
    branchName: '',
    branchCode: '',
    address: ''
  })
  const [feedback, setFeedback] = useState(null)

  const bankRows = useMemo(() => banks.map(normalizeBank), [banks])
  const branchRows = useMemo(() => branches.map(normalizeBranch), [branches])

  const bankColumns = [
    { id: 'bankName', label: 'Bank', accessor: (row) => row.bankName },
    { id: 'ifscCode', label: 'IFSC/SWIFT', accessor: (row) => row.ifscCode },
    {
      id: 'headOfficeAddress',
      label: 'Head office',
      accessor: (row) => row.headOfficeAddress ?? '—'
    },
    {
      id: 'branchCount',
      label: 'Branches',
      accessor: (row) => row.branchCount
    }
  ]

  const branchColumns = [
    { id: 'branchName', label: 'Branch', accessor: (row) => row.branchName },
    { id: 'branchCode', label: 'Code', accessor: (row) => row.branchCode },
    { id: 'bankName', label: 'Bank', accessor: (row) => row.bankName },
    { id: 'address', label: 'Address', accessor: (row) => row.address || '—' },
    { id: 'managerName', label: 'Manager', accessor: (row) => row.managerName || '—' }
  ]

  const handleBankChange = (event) => {
    const { name, value } = event.target
    setBankForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const handleBranchChange = (event) => {
    const { name, value } = event.target
    setBranchForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const submitBank = async (event) => {
    event.preventDefault()
    try {
      await createBank(bankForm)
      setFeedback('Bank created.')
      setBankForm({ bankName: '', headOfficeAddress: '', ifscCode: '' })
    } catch (err) {
      setFeedback(err.message ?? 'Unable to create bank')
    }
  }

  const submitBranch = async (event) => {
    event.preventDefault()
    if (!branchForm.bankId) return
    try {
      await createBranch({
        bankId: Number(branchForm.bankId),
        branchName: branchForm.branchName,
        branchCode: branchForm.branchCode,
        address: branchForm.address
      })
      setFeedback('Branch created.')
      setBranchForm({ bankId: '', branchName: '', branchCode: '', address: '' })
    } catch (err) {
      setFeedback(err.message ?? 'Unable to create branch')
    }
  }

  const handleDeleteBank = async (id) => {
    try {
      await deleteBank(id)
      setFeedback('Bank deleted.')
    } catch (err) {
      setFeedback(err.message ?? 'Unable to delete bank')
    }
  }

  const handleDeleteBranch = async (id) => {
    try {
      await deleteBranch(id)
      setFeedback('Branch deleted.')
    } catch (err) {
      setFeedback(err.message ?? 'Unable to delete branch')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Sysadmin</p>
        <h1 className="text-3xl font-semibold text-slate-900">Manage banks & branches</h1>
        <p className="text-sm text-slate-500">
          Surfaces `/api/Banks` and `/api/Branches` endpoints for create/delete operations.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <form
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4"
          onSubmit={submitBank}
        >
          <h2 className="text-lg font-semibold text-slate-900">Create bank</h2>
          <label className="text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              name="bankName"
              required
              value={bankForm.bankName}
              onChange={handleBankChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Head office
            <input
              type="text"
              name="headOfficeAddress"
              value={bankForm.headOfficeAddress}
              onChange={handleBankChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            IFSC / SWIFT
            <input
              type="text"
              name="ifscCode"
              required
              value={bankForm.ifscCode}
              onChange={handleBankChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Create bank
          </button>
        </form>
        <form
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4"
          onSubmit={submitBranch}
        >
          <h2 className="text-lg font-semibold text-slate-900">Create branch</h2>
          <label className="text-sm font-medium text-slate-700">
            Bank
            <select
              name="bankId"
              required
              value={branchForm.bankId}
              onChange={handleBranchChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              <option value="">Select bank</option>
              {bankRows.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Branch name
            <input
              type="text"
              name="branchName"
              required
              value={branchForm.branchName}
              onChange={handleBranchChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Branch code
            <input
              type="text"
              name="branchCode"
              required
              value={branchForm.branchCode}
              onChange={handleBranchChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Address
            <input
              type="text"
              name="address"
              value={branchForm.address}
              onChange={handleBranchChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Create branch
          </button>
        </form>
      </div>
      {(error || feedback) && (
        <p className={`text-sm ${error ? 'text-rose-500' : 'text-emerald-600'}`}>
          {error || feedback}
        </p>
      )}
      <DataGrid
        title="Banks"
        columns={bankColumns}
        rows={bankRows}
        rowActions={(row) => (
          <button
            type="button"
            onClick={() => handleDeleteBank(row.id)}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600"
          >
            Delete
          </button>
        )}
      />
      <DataGrid
        title="Branches"
        columns={branchColumns}
        rows={branchRows}
        rowActions={(row) => (
          <button
            type="button"
            onClick={() => handleDeleteBranch(row.id)}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600"
          >
            Delete
          </button>
        )}
      />
    </section>
  )
}


