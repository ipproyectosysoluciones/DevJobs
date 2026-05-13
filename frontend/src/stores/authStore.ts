/**
 * @fileoverview Store de autenticación con Zustand
 * @fileoverview Authentication store with Zustand
 * @module stores/authStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

/**
 * Tipos de usuario | User types
 * @typedef {'admin' | 'employer' | 'job_seeker' | 'premium' | 'moderator'} UserRole
 */
export type UserRole = 'admin' | 'employer' | 'job_seeker' | 'premium' | 'moderator'

/**
 * Interfaz de usuario | User interface
 * @interface User
 */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

/**
 * Estado del store de autenticación | Auth store state
 * @interface AuthState
 */
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Acciones del store | Store actions
 * @interface AuthActions
 */
interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  logout: () => void
  clearError: () => void
  setUser: (user: User) => void
}

/**
 * Store de autenticación | Auth store
 * @function useAuthStore
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Estado inicial | Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Acción de login | Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('/api/auth/login', { email, password })
          const { token, user } = response.data
          
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Configurar token en axios | Set token in axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: unknown) {
          const message = axios.isAxiosError(error) 
            ? error.response?.data?.message || 'Error de autenticación'
            : 'Error desconocido'
          
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      // Acción de registro | Register action
      register: async (email: string, password: string, name: string, role: UserRole) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post('/api/auth/register', { email, password, name, role })
          const { token, user } = response.data
          
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          })
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: unknown) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Error de registro'
            : 'Error desconocido'
          
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      // Acción de logout | Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
        delete axios.defaults.headers.common['Authorization']
      },

      // Limpiar error | Clear error
      clearError: () => set({ error: null }),

      // Establecer usuario | Set user
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'devjobs-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
