import Link from 'next/link'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import QuickStatusUpdate from '@/components/QuickStatusUpdate'
import StatusFilter from '@/components/StatusFilter'

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  complete: 'bg-green-100 text-green-800 border-green-200',
}

const statusLabels: Record<string, string> = {
  lead: 'Lead',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  complete: 'Complete',
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, clients(id, name, address)')
    .order('created_at', { ascending: false })

  const counts = {
    lead: jobs?.filter(j => j.status === 'lead').length ?? 0,
    scheduled: jobs?.filter(j => j.status === 'scheduled').length ?? 0,
    in_progress: jobs?.filter(j => j.status === 'in_progress').length ?? 0,
    complete: jobs?.filter(j => j.status === 'complete').length ?? 0,
  }

  const pipeline = jobs
    ?.filter(j => j.status !== 'complete')
    .reduce((s, j) => s + (j.estimate ?? 0), 0) ?? 0

  const displayed = status ? jobs?.filter(j => j.status === status) : jobs

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
        {pipeline > 0 && (
          <span className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            ${pipeline.toLocaleString()} open pipeline
          </span>
        )}
      </div>

      {/* Status summary */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(counts) as (keyof typeof counts)[]).map(s => (
          <div
            key={s}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${statusColors[s]}`}
          >
            <span>{statusLabels[s]}</span>
            <span className="font-bold">{counts[s]}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <Suspense>
        <StatusFilter />
      </Suspense>

      {/* Jobs list */}
      {!displayed?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No jobs found.</p>
          <Link href="/" className="text-sm text-blue-600 hover:underline mt-2 block">
            ← Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {displayed.map(job => {
            const client = job.clients as { id: string; name: string; address?: string } | null
            return (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <QuickStatusUpdate
                        jobId={job.id}
                        clientId={client?.id ?? ''}
                        currentStatus={job.status}
                      />
                      <span className="font-semibold text-gray-900">{job.title}</span>
                    </div>
                    {client && (
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        {client.name}
                        {client.address && (
                          <span className="text-gray-400 ml-1.5">· {client.address}</span>
                        )}
                      </Link>
                    )}
                    {job.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{job.description}</p>
                    )}
                    {job.notes && (
                      <p className="text-gray-400 text-sm mt-0.5 italic line-clamp-1">{job.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {job.estimate ? (
                      <span className="font-semibold text-green-700">${job.estimate.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-300 text-sm">No estimate</span>
                    )}
                    <div className="flex gap-1.5">
                      {client && (
                        <Link
                          href={`/clients/${client.id}/jobs/${job.id}/estimate`}
                          className="text-xs text-slate-600 border border-gray-200 px-2 py-1 rounded-lg hover:bg-slate-50"
                          title="View estimate"
                        >
                          📄
                        </Link>
                      )}
                      {client && (
                        <Link
                          href={`/clients/${client.id}/jobs/${job.id}/edit`}
                          className="text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
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
