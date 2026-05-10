/**
 * @fileoverview Componente principal de la aplicación
 * @fileoverview Main application component
 * @module App
 * 
 * Punto de entrada principal de la aplicación React
 * Main entry point for the React application
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Jobs from '@/pages/Jobs'
import JobDetail from '@/pages/JobDetail'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Profile from '@/pages/Profile'
import Chat from '@/pages/Chat'
import Donations from '@/pages/Donations'
import Analytics from '@/pages/Analytics'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

/**
 * Componente protegido | Protected component
 * @component ProtectedRoute
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

/**
 * Componente de rutas públicas | Public routes component
 * @component PublicRoutes
 */
function PublicRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

/**
 * Componente de rutas protegidas | Protected routes component
 * @component PrivateRoutes
 */
function PrivateRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

/**
 * Componente principal de la aplicación
 * @component App
 */
function App() {
  const { isAuthenticated } = useAuthStore()
  
  return isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />
}

export default App
