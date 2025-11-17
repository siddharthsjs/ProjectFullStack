import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { useApi } from '../hooks/useApi'

const BankingDataContext = createContext(null)

export const BankingDataProvider = ({ children }) => {
  const { isSysAdmin, session } = useAuth()
  const api = useApi()

  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [banks, setBanks] = useState([])
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const resetState = () => {
    setAccounts([])
    setTransactions([])
    setBanks([])
    setBranches([])
    setUsers([])
    setError(null)
  }

  const loadAccounts = useCallback(async () => {
    if (!session?.tokens?.accessToken) return
    const data = await api.get('/Accounts')
    setAccounts(data)
  }, [api, session])

  const loadTransactions = useCallback(async () => {
    if (!session?.tokens?.accessToken) return
    const data = await api.get('/Transactions/my-transactions')
    setTransactions(data)
  }, [api, session])

  const loadBanks = useCallback(async () => {
    if (!session?.tokens?.accessToken) return
    try {
      const data = await api.get('/Banks')
      setBanks(data)
    } catch (err) {
      console.error('Failed to load banks', err)
      setBanks([])
    }
  }, [api, session])

  const loadBranches = useCallback(async () => {
    if (!session?.tokens?.accessToken) return
    try {
      const data = await api.get('/Branches')
      setBranches(data)
    } catch (err) {
      console.error('Failed to load branches', err)
      setBranches([])
    }
  }, [api, session])

  const loadUsers = useCallback(async () => {
    if (!session?.tokens?.accessToken || !isSysAdmin) {
      setUsers([])
      return
    }
    try {
      const data = await api.get('/Users')
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users', err)
      setUsers([])
    }
  }, [api, session, isSysAdmin])

  const loadAll = useCallback(async () => {
    if (!session?.tokens?.accessToken) {
      resetState()
      return
    }
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        loadAccounts(),
        loadTransactions(),
        loadBanks(),
        loadBranches(),
        loadUsers()
      ])
    } catch (err) {
      setError(err.message ?? 'Unable to sync data from API')
    } finally {
      setLoading(false)
    }
  }, [session, loadAccounts, loadTransactions, loadBanks, loadBranches, loadUsers])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const wrapAction = useCallback(
    async (fn) => {
      setError(null)
      try {
        const result = await fn()
        await loadAll()
        return result
      } catch (err) {
        setError(err.message ?? 'Action failed')
        throw err
      }
    },
    [loadAll]
  )

  const deposit = useCallback(
    (payload) =>
      wrapAction(() => api.post('/Transactions/deposit', payload)),
    [api, wrapAction]
  )

  const withdraw = useCallback(
    (payload) =>
      wrapAction(() => api.post('/Transactions/withdraw', payload)),
    [api, wrapAction]
  )

  const transfer = useCallback(
    (payload) =>
      wrapAction(() => api.post('/Transactions/transfer', payload)),
    [api, wrapAction]
  )

  const createAccount = useCallback(
    (payload) => wrapAction(() => api.post('/Accounts', payload)),
    [api, wrapAction]
  )

  const closeAccount = useCallback(
    (accountId) => wrapAction(() => api.del(`/Accounts/${accountId}`)),
    [api, wrapAction]
  )

  const createUser = useCallback(
    (payload) => wrapAction(() => api.post('/Users', payload)),
    [api, wrapAction]
  )

  const deleteUser = useCallback(
    (userId) => wrapAction(() => api.del(`/Users/${userId}`)),
    [api, wrapAction]
  )

  const createBank = useCallback(
    (payload) => wrapAction(() => api.post('/Banks', payload)),
    [api, wrapAction]
  )

  const deleteBank = useCallback(
    (bankId) => wrapAction(() => api.del(`/Banks/${bankId}`)),
    [api, wrapAction]
  )

  const createBranch = useCallback(
    (payload) => wrapAction(() => api.post('/Branches', payload)),
    [api, wrapAction]
  )

  const deleteBranch = useCallback(
    (branchId) => wrapAction(() => api.del(`/Branches/${branchId}`)),
    [api, wrapAction]
  )

  const value = useMemo(
    () => ({
      loading,
      error,
      accounts,
      transactions,
      banks,
      branches,
      users,
      reload: loadAll,
      loadAccounts,
      loadTransactions,
      loadBanks,
      loadBranches,
      loadUsers,
      deposit,
      withdraw,
      transfer,
      createAccount,
      closeAccount,
      createUser,
      deleteUser,
      createBank,
      deleteBank,
      createBranch,
      deleteBranch
    }),
    [
      loading,
      error,
      accounts,
      transactions,
      banks,
      branches,
      users,
      loadAll,
      loadAccounts,
      loadTransactions,
      loadBanks,
      loadBranches,
      loadUsers,
      deposit,
      withdraw,
      transfer,
      createAccount,
      closeAccount,
      createUser,
      deleteUser,
      createBank,
      deleteBank,
      createBranch,
      deleteBranch
    ]
  )

  return (
    <BankingDataContext.Provider value={value}>
      {children}
    </BankingDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBankingData = () => {
  const ctx = useContext(BankingDataContext)
  if (!ctx) {
    throw new Error('useBankingData must be used within BankingDataProvider')
  }
  return ctx
}

