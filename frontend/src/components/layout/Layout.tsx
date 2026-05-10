/**
 * @fileoverview Layout principal de la aplicación
 * @fileoverview Main application layout
 * @module components/layout/Layout
 */

import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/**
 * Layout principal
 * @component Layout
 * @description Estructura base con header, contenido y footer
 */
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
