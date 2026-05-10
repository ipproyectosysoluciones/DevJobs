/**
 * @fileoverview Página de Login
 * @fileoverview Login page
 * @module pages/auth/Login
 */

import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Página de inicio de sesión
 * @component Login
 */
export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch {
      // Error handled in store
    }
  }

  return (
    <>
      <Helmet>
        <title>Iniciar sesión - DevJobs</title>
      </Helmet>

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold">Bienvenido de nuevo</h1>
              <p className="text-muted-foreground">
                Inicia sesión en tu cuenta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                ¿No tienes cuenta?{' '}
              </span>
              <Link to="/register" className="font-medium text-primary hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
