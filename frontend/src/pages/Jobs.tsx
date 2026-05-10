/**
 * @fileoverview Página de Empleos
 * @fileoverview Jobs page
 * @module pages/Jobs
 */

import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Search, MapPin, Briefcase, ArrowRight } from 'lucide-react'

/**
 * Interfaz de empleo | Job interface
 * @interface Job
 */
interface Job {
  _id: string
  title: string
  description: string
  requirements: string[]
  location: {
    city: string
    country: string
    remote: boolean
  }
  type: string
  salary?: {
    min: number
    max: number
    currency: string
  }
  createdAt: string
}

/**
 * Página de empleos
 * @component Jobs
 */
export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs')
        setJobs(response.data.jobs || [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Helmet>
        <title>Empleos - DevJobs</title>
        <meta name="description" content="Explora las últimas ofertas de empleo en tecnología." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Empleos Disponibles</h1>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar empleos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={[
                  "w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4",
                  "text-sm placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary"
                ].join(" ")}
              />
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando empleos...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No se encontraron empleos</h2>
            <p className="mt-2 text-muted-foreground">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className={[
                  "group block rounded-lg border border-border bg-card p-6",
                  "hover:border-primary hover:shadow-lg",
                  "transition-all"
                ].join(" ")}
              >
                <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
                  {job.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location.city}, {job.location.country}
                  </div>
                  {job.location.remote && (
                    <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                      Remoto
                    </span>
                  )}
                </div>
                {job.salary && (
                  <div className="mt-4 text-sm font-medium text-primary">
                    {job.salary.currency} {job.salary.min} - {job.salary.max}
                  </div>
                )}
                <div className="mt-4 flex items-center text-sm font-medium text-primary">
                  Ver detalles
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
