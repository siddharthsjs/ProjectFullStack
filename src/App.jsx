import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { MainLayout } from './components/layout/MainLayout.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { AboutPage } from './pages/AboutPage.jsx'
import { PlansPage } from './pages/PlansPage.jsx'
import { FAQPage } from './pages/FAQPage.jsx'
import { ContactPage } from './pages/ContactPage.jsx'
import { AccountsPage } from './pages/AccountsPage.jsx'
import { TransactionsPage } from './pages/TransactionsPage.jsx'
import { ManageUsersPage } from './pages/ManageUsersPage.jsx'
import { ManageBanksPage } from './pages/ManageBanksPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ProtectedRoute } from './components/navigation/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          index
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <AccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'SysAdmin', 'Sysadmin']}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banks"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'SysAdmin', 'Sysadmin']}>
              <ManageBanksPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
