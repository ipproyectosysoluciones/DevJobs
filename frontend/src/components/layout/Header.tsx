/**
 * @fileoverview Header de la aplicación
 * @fileoverview Application header
 * @module components/layout/Header
 */

import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { Briefcase, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

/**
 * Header de navegación
 * @component Header
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">DevJobs</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/jobs" className="text-sm font-medium hover:text-primary">
            Empleos
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/chat" className="text-sm font-medium hover:text-primary">
                Chat
              </Link>
              <Link to="/donations" className="text-sm font-medium hover:text-primary">
                Donaciones
              </Link>
              {user?.role === 'admin' && (
                <Link to="/analytics" className="text-sm font-medium hover:text-primary">
                  Analíticas
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary"
              >
                <User className="h-4 w-4" />
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  "text-muted-foreground hover:text-destructive"
                )}
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium hover:text-primary"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className={cn(
                  "rounded-md bg-primary px-4 py-2 text-sm font-medium",
                  "text-primary-foreground hover:bg-primary/90"
                )}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-4">
          <div className="flex flex-col gap-4">
            <Link to="/jobs" className="text-sm font-medium">
              Empleos
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/chat" className="text-sm font-medium">
                  Chat
                </Link>
                <Link to="/donations" className="text-sm font-medium">
                  Donaciones
                </Link>
                <Link to="/profile" className="text-sm font-medium">
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm font-medium text-destructive"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="text-sm font-medium">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
