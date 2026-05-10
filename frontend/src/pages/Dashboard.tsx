/**
 * @fileoverview Página de Dashboard
 * @fileoverview Dashboard page
 * @module pages/Dashboard
 */

import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react'

/**
 * Dashboard principal
 * @component Dashboard
 */
export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>DevJobs - Encuentra tu próximo empleo tech</title>
        <meta name="description" content="La plataforma líder para encontrar empleos en tecnología. Conecta con las mejores empresas del sector." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Encuentra tu próximo{' '}
              <span className="text-primary">empleo tech</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Miles de ofertas de trabajo en las mejores empresas de tecnología.
              Postula hoy y haz crecer tu carrera profesional.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/jobs"
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-md bg-primary px-8 py-3 text-lg font-medium",
                  "text-primary-foreground hover:bg-primary/90",
                  "transition-all hover:scale-105"
                ].join(" ")}
              >
                Ver ofertas
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-md border border-border bg-background px-8 py-3 text-lg font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-all"
                ].join(" ")}
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <Briefcase className="mb-4 h-12 w-12 text-primary" />
              <div className="mb-2 text-4xl font-bold">1500+</div>
              <div className="text-muted-foreground">Empleos disponibles</div>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <Users className="mb-4 h-12 w-12 text-primary" />
              <div className="mb-2 text-4xl font-bold">12k+</div>
              <div className="text-muted-foreground">Profesionales registrados</div>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center">
              <TrendingUp className="mb-4 h-12 w-12 text-primary" />
              <div className="mb-2 text-4xl font-bold">85%</div>
              <div className="text-muted-foreground">Encuentran empleo</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            ¿Buscas talento técnico?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Publica tus ofertas de empleo y reachionaliza a los mejores candidatos.
          </p>
          <Link
            to="/register"
            className={[
              "inline-flex items-center justify-center gap-2",
              "rounded-md bg-background px-8 py-3 text-lg font-medium",
              "text-primary hover:bg-background/90",
              "transition-all"
            ].join(" ")}
          >
            Publicar empleo
          </Link>
        </div>
      </section>
    </>
  )
}
