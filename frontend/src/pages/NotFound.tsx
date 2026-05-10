import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 - No encontrado</title></Helmet>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-4xl font-bold">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Página no encontrada
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            La página que buscas no existe o ha sido movida.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-5 w-5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </>
  )
}
