import { Helmet } from 'react-helmet-async'

export default function Chat() {
  return (
    <>
      <Helmet><title>Chat - DevJobs</title></Helmet>
      <div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Chat con Reclutador</h1></div>
    </>
  )
}
