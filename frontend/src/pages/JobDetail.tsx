/**
 * @fileoverview Página de Detalle de Empleo
 * @fileoverview Job Detail page
 * @module pages/JobDetail
 */

import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'

export default function JobDetail() {
  const { id } = useParams()
  
  return (
    <>
      <Helmet>
        <title>Detalle del Empleo - DevJobs</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Detalles del Empleo #{id}</h1>
      </div>
    </>
  )
}
