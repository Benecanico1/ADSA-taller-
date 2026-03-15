import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { NotificationProvider } from './lib/NotificationContext'
import ProtectedRoute from './lib/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Appointments from './pages/Appointments'
import ClinicalHistory from './pages/ClinicalHistory'
import ClientProfile from './pages/ClientProfile'
import ProfileSettings from './pages/ProfileSettings'
import BackendAdminPanel from './pages/BackendAdminPanel'
import WorkshopKanbanBoard from './pages/WorkshopKanbanBoard'
import InventoryDetails from './pages/InventoryDetails'
import ReceptionScanner from './pages/ReceptionScanner'
import ActiveReception from './pages/ActiveReception'
import BudgetApproval from './pages/BudgetApproval'
import ServicesPricing from './pages/ServicesPricing'
import NotificationsConfig from './pages/NotificationsConfig'
import BusinessIntelligence from './pages/BusinessIntelligence'
import DigitalWarranties from './pages/DigitalWarranties'
import Warranties from './pages/Warranties'
import CurrentAccounts from './pages/CurrentAccounts'
import UserRoles from './pages/UserRoles'
import MechanicCommissions from './pages/MechanicCommissions'
import ElectronicBilling from './pages/ElectronicBilling'
import PasswordRecovery from './pages/PasswordRecovery'
import CustomerDashboard from './pages/CustomerDashboard'
import MechanicDashboard from './pages/MechanicDashboard'
import MechanicBudgeting from './pages/MechanicBudgeting'
import AddMotorcycle from './pages/AddMotorcycle'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/mechanic-dashboard" element={<ProtectedRoute><MechanicDashboard /></ProtectedRoute>} />
            <Route path="/mechanic-budget" element={<ProtectedRoute><MechanicBudgeting /></ProtectedRoute>} />
            <Route path="/add-motorcycle" element={<ProtectedRoute><AddMotorcycle /></ProtectedRoute>} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/history" element={<ClinicalHistory />} />
            <Route path="/profile" element={<ClientProfile />} />
            <Route path="/warranties" element={<Warranties />} />
            <Route path="/settings" element={<ProfileSettings />} />
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute><BackendAdminPanel /></AdminRoute>} />
            <Route path="/kanban" element={<AdminRoute><WorkshopKanbanBoard /></AdminRoute>} />
            <Route path="/inventory" element={<AdminRoute><InventoryDetails /></AdminRoute>} />
            <Route path="/scanner" element={<AdminRoute><ReceptionScanner /></AdminRoute>} />
            <Route path="/reception" element={<AdminRoute><ActiveReception /></AdminRoute>} />
            <Route path="/budget" element={<AdminRoute><BudgetApproval /></AdminRoute>} />
            <Route path="/services" element={<AdminRoute><ServicesPricing /></AdminRoute>} />
            <Route path="/notifications" element={<AdminRoute><NotificationsConfig /></AdminRoute>} />
            <Route path="/bi" element={<AdminRoute><BusinessIntelligence /></AdminRoute>} />
            <Route path="/accounts" element={<AdminRoute><CurrentAccounts /></AdminRoute>} />
            <Route path="/users" element={<AdminRoute><UserRoles /></AdminRoute>} />
            <Route path="/commissions" element={<AdminRoute><MechanicCommissions /></AdminRoute>} />
            <Route path="/billing" element={<AdminRoute><ElectronicBilling /></AdminRoute>} />
            <Route path="/forgot-password" element={<PasswordRecovery />} />
            {/* Catch-all redirect to auth page */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
