import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { deleteClient, deleteJob } from '@/app/actions'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  complete: 'bg-green-100 text-green-800',
}

const statusLabels: Record<string, string> = {
  lead: 'Lead',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  complete: 'Complete',
}

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!client) notFound()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const { data: allFiles } = await supabase
    .from('files')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const clientFiles = allFiles?.filter((f) => !f.job_id) ?? []
  const filesByJob = (jobId: string) => allFiles?.filter((f) => f.job_id === jobId) ?? []

  const deleteClientWithId = deleteClient.bind(null, id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">← Clients</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.phone && <p className="text-gray-600 mt-1">📞 {client.phone}</p>}
            {client.email && <p className="text-gray-600">✉️ {client.email}</p>}
            {client.address && <p className="text-gray-600">📍 {client.address}</p>}
            {client.notes && <p className="text-gray-500 mt-3 text-sm">{client.notes}</p>}
          </div>
          <div className="flex gap-2">
            <Link href={`/clients/${id}/edit`} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              Edit
            </Link>
            <form action={deleteClientWithId}>
              <button type="submit" className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Client Documents</p>
          <FileList files={clientFiles} />
          <div className="mt-2">
            <FileUpload clientId={id} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Jobs</h2>
        <Link
          href={`/clients/${id}/jobs/new`}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm"
        >
          + Add Job
        </Link>
      </div>

      {!jobs?.length ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-200">
          No jobs yet. Click <strong>+ Add Job</strong> to add one.
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => {
            const deleteJobWithIds = deleteJob.bind(null, job.id, id)
            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[job.status]}`}>
                        {statusLabels[job.status]}
                      </span>
                    </div>
                    {job.estimate && (
                      <p className="text-green-700 font-medium mt-1">${job.estimate.toLocaleString()}</p>
                    )}
                    {job.description && <p className="text-gray-500 text-sm mt-1">{job.description}</p>}
                    {job.notes && <p className="text-gray-400 text-sm mt-1 italic">{job.notes}</p>}
                    {job.photo_link && (
                      <a href={job.photo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mt-1">
                        📁 View Photos
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/clients/${id}/jobs/${job.id}/edit`} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                      Edit
                    </Link>
                    <form action={deleteJobWithIds}>
                      <button type="submit" className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <FileList files={filesByJob(job.id)} />
                  <div className="mt-2">
                    <FileUpload clientId={id} jobId={job.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
