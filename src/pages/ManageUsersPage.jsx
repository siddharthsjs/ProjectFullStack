import { useState } from 'react'
import { useBankingData } from '../context/BankingDataContext'
import { DataGrid } from '../components/ui/DataGrid'

const normalizeUser = (user) => ({
  id: user.userId ?? user.UserId,
  firstName: user.firstName ?? user.FirstName,
  lastName: user.lastName ?? user.LastName,
  email: user.email ?? user.Email,
  userType: user.userType ?? user.UserType,
  dateOfBirth: user.dateOfBirth ?? user.DateOfBirth,
  roles: user.roles ?? user.Roles ?? []
})

export const ManageUsersPage = () => {
  const { users, createUser, deleteUser, error } = useBankingData()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    userType: 'Normal'
  })
  const [feedback, setFeedback] = useState(null)

  const mappedUsers = users.map(normalizeUser)

  const columns = [
    { id: 'firstName', label: 'First name', accessor: (row) => row.firstName },
    { id: 'lastName', label: 'Last name', accessor: (row) => row.lastName },
    { id: 'email', label: 'Email', accessor: (row) => row.email },
    { id: 'userType', label: 'Type', accessor: (row) => row.userType },
    {
      id: 'roles',
      label: 'Roles',
      accessor: (row) => row.roles.join(', ')
    }
  ]

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFeedback(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await createUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        userType: form.userType
      })
      setFeedback('User created.')
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dateOfBirth: '',
        userType: 'Normal'
      })
    } catch (err) {
      setFeedback(err.message ?? 'Unable to create user')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      setFeedback('User deleted.')
    } catch (err) {
      setFeedback(err.message ?? 'Unable to delete user')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Sysadmin</p>
        <h1 className="text-3xl font-semibold text-slate-900">Manage users</h1>
        <p className="text-sm text-slate-500">
          Interfaces with `/api/Users` endpoints (list, create, delete) and surfaces role metadata.
        </p>
      </header>
      <form
        className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="text-sm font-medium text-slate-700">
          First name
          <input
            type="text"
            name="firstName"
            required
            value={form.firstName}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Last name
          <input
            type="text"
            name="lastName"
            required
            value={form.lastName}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
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
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Date of birth
          <input
            type="date"
            name="dateOfBirth"
            required
            value={form.dateOfBirth}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          User type
          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          >
            <option value="Normal">Normal</option>
            <option value="Bank">Bank</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white"
          >
            Create user
          </button>
        </div>
      </form>
      {(error || feedback) && (
        <p className={`text-sm ${error ? 'text-rose-500' : 'text-emerald-600'}`}>
          {error || feedback}
        </p>
      )}
      <DataGrid
        title="Users"
        columns={columns}
        rows={mappedUsers}
        rowActions={(row) => (
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600"
          >
            Delete
          </button>
        )}
      />
    </section>
  )
}


