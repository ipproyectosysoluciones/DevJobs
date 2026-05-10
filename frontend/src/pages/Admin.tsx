import { Helmet } from 'react-helmet-async'

export default function Admin() {
  return (
    <>
      <Helmet><title>Admin - DevJobs</title></Helmet>
      <div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Panel de Administración</h1></div>
    </>
  )
}
