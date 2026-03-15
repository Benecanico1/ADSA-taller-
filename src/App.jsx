import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { NotificationProvider } from './lib/NotificationContext'
import { CartProvider } from './lib/CartContext'
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
import SuperAdminSetup from './pages/SuperAdminSetup'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SuperAdminBilling from './pages/SuperAdminBilling'
import SuperAdminSettings from './pages/SuperAdminSettings'
import NewTenantForm from './pages/NewTenantForm'
import FinanceDashboard from './pages/FinanceDashboard'
import SupplierManagement from './pages/SupplierManagement'
import InventoryManager from './pages/InventoryManager'
import WorkOrdersDashboard from './pages/WorkOrdersDashboard'
import OperationsDashboard from './pages/OperationsDashboard'
import TurnosDashboard from './pages/TurnosDashboard'
import Storefront from './pages/Storefront'
import Checkout from './pages/Checkout'
import AdminMarketplaceOrders from './pages/AdminMarketplaceOrders'
import SystemSettings from './pages/SystemSettings'
import InvoicePrintView from './pages/InvoicePrintView'
import ServicesPage from './pages/ServicesPage'
import MotoRoutes from './pages/MotoRoutes'
import RewardsPage from './pages/RewardsPage'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
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
            
            {/* Storefront & Social / Rewards */}
            <Route path="/tienda" element={<Storefront />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><MotoRoutes /></ProtectedRoute>} />
            <Route path="/services-page" element={<ServicesPage />} />
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
            
            {/* Newly Integrated Admin Routes (Recovered) */}
            <Route path="/admin/finance" element={<AdminRoute><FinanceDashboard /></AdminRoute>} />
            <Route path="/admin/suppliers" element={<AdminRoute><SupplierManagement /></AdminRoute>} />
            <Route path="/admin/inventory-manager" element={<AdminRoute><InventoryManager /></AdminRoute>} />
            <Route path="/admin/work-orders" element={<AdminRoute><WorkOrdersDashboard /></AdminRoute>} />
            <Route path="/admin/operations" element={<AdminRoute><OperationsDashboard /></AdminRoute>} />
            <Route path="/admin/turnos" element={<AdminRoute><TurnosDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminMarketplaceOrders /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
            <Route path="/admin/invoice/print/:id" element={<AdminRoute><InvoicePrintView /></AdminRoute>} />

            {/* Initialize System Route */}
            <Route path="/setup-maestro-init" element={<ProtectedRoute><SuperAdminSetup /></ProtectedRoute>} />
            
            {/* SaaS Admin Routes (Super Admin Only) */}
            <Route path="/saas-admin" element={<AdminRoute><SuperAdminDashboard /></AdminRoute>} />
            <Route path="/saas-admin/billing" element={<AdminRoute><SuperAdminBilling /></AdminRoute>} />
            <Route path="/saas-admin/settings" element={<AdminRoute><SuperAdminSettings /></AdminRoute>} />
            <Route path="/saas-admin/empresa/nueva" element={<AdminRoute><NewTenantForm /></AdminRoute>} />
            
            {/* Catch-all redirect to auth page */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
