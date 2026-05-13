import { Helmet } from 'react-helmet-async'

export default function Profile() {
  return (
    <>
      <Helmet><title>Perfil - DevJobs</title></Helmet>
      <div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Mi Perfil</h1></div>
    </>
  )
}
