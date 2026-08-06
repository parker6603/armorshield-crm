import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClient, getClientJobs, getClientFiles } from '@/lib/data'
import { deleteClient, deleteJob } from '@/app/actions'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import QuickStatusUpdate from '@/components/QuickStatusUpdate'
import FollowUpQuickSet from '@/components/FollowUpQuickSet'
import NoteLogger from '@/components/NoteLogger'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [client, jobs, allFiles] = await Promise.all([
    getClient(id),
    getClientJobs(id),
    getClientFiles(id),
  ])
  if (!client) notFound()

  const clientFiles = allFiles.filter((f) => !f.job_id)
  const filesByJob = (jobId: string) => allFiles.filter((f) => f.job_id === jobId)

  const deleteClientWithId = deleteClient.bind(null, id)

  // Stats
  const totalEstimate = jobs.reduce((s, j) => s + (j.estimate ?? 0), 0)
  const activeCount = jobs.filter(j => j.status !== 'complete').length
  const completeCount = jobs.filter(j => j.status === 'complete').length

  // Sort jobs: active first, complete last
  const statusPriority: Record<string, number> = { in_progress: 0, scheduled: 1, lead: 2, complete: 3 }
  const sortedJobs = [...jobs].sort(
    (a, b) => (statusPriority[a.status] ?? 4) - (statusPriority[b.status] ?? 4)
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">← Clients</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.phone && (
              <a href={`tel:${client.phone}`} className="text-gray-600 mt-1 block hover:text-blue-600 transition-colors">
                📞 {client.phone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="text-gray-600 block hover:text-blue-600 transition-colors">
                ✉️ {client.email}
              </a>
            )}
            {client.address && <p className="text-gray-600">📍 {client.address}</p>}
            {client.follow_up_date && (
              <p className="text-amber-600 text-sm mt-1 font-medium">
                📅 Follow up: {new Date(client.follow_up_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {client.notes && (
              <p className="text-gray-500 mt-3 text-sm whitespace-pre-wrap leading-relaxed">{client.notes}</p>
            )}
            <div className="mt-3">
              <NoteLogger clientId={id} />
            </div>
            <div className="mt-3">
              <FollowUpQuickSet clientId={id} hasFollowUp={!!client.follow_up_date} />
            </div>
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

        {jobs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-5 flex-wrap">
            <div>
              <p className="text-2xl font-bold text-slate-700 tabular-nums">{jobs.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Jobs</p>
            </div>
            {totalEstimate > 0 && (
              <div>
                <p className="text-2xl font-bold text-green-600 tabular-nums">${totalEstimate.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">Estimated</p>
              </div>
            )}
            {activeCount > 0 && (
              <div>
                <p className="text-2xl font-bold text-orange-500 tabular-nums">{activeCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Active</p>
              </div>
            )}
            {completeCount > 0 && (
              <div>
                <p className="text-2xl font-bold text-green-500 tabular-nums">{completeCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Complete</p>
              </div>
            )}
          </div>
        )}

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

      {!sortedJobs.length ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-200">
          No jobs yet. Click <strong>+ Add Job</strong> to add one.
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedJobs.map((job) => {
            const deleteJobWithIds = deleteJob.bind(null, job.id, id)
            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <QuickStatusUpdate jobId={job.id} clientId={id} currentStatus={job.status} />
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
                  <div className="flex gap-2 ml-4 flex-shrink-0 flex-wrap justify-end">
                    <Link href={`/clients/${id}/jobs/${job.id}/estimate`} className="text-sm border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                      📄 Estimate
                    </Link>
                    <Link href={`/clients/${id}/jobs/${job.id}/invoice`} className="text-sm border border-green-300 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50">
                      📋 Invoice
                    </Link>
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
