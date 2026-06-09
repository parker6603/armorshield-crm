import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-400',
  scheduled: 'bg-blue-400',
  in_progress: 'bg-orange-400',
  complete: 'bg-green-500',
}

const statusLabels: Record<string, string> = {
  lead: 'Lead',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  complete: 'Complete',
}

export default async function AnalyticsPage() {
  const [{ data: clients }, { data: jobs }] = await Promise.all([
    supabase.from('clients').select('id, name, follow_up_date, jobs(estimate, status)'),
    supabase.from('jobs').select('*'),
  ])

  const totalClients = clients?.length ?? 0
  const totalJobs = jobs?.length ?? 0

  const byStatus = {
    lead: jobs?.filter(j => j.status === 'lead') ?? [],
    scheduled: jobs?.filter(j => j.status === 'scheduled') ?? [],
    in_progress: jobs?.filter(j => j.status === 'in_progress') ?? [],
    complete: jobs?.filter(j => j.status === 'complete') ?? [],
  }

  const pipeline = jobs
    ?.filter(j => j.status !== 'complete')
    .reduce((s, j) => s + (j.estimate ?? 0), 0) ?? 0

  const won = jobs
    ?.filter(j => j.status === 'complete')
    .reduce((s, j) => s + (j.estimate ?? 0), 0) ?? 0

  const completionRate = totalJobs > 0
    ? Math.round((byStatus.complete.length / totalJobs) * 100)
    : 0

  const topClients = (clients ?? [])
    .map(c => ({
      id: c.id,
      name: c.name,
      total: (c.jobs as { estimate: number | null }[])
        ?.reduce((s, j) => s + (j.estimate ?? 0), 0) ?? 0,
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const maxClientTotal = topClients[0]?.total ?? 1

  const today = new Date().toISOString().split('T')[0]
  const overdueFollowUps = (clients ?? []).filter(
    c => c.follow_up_date && c.follow_up_date <= today
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="text-sm text-gray-400">ArmorShield Roofing & Construction</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Clients', value: totalClients, color: 'text-slate-700' },
          { label: 'Open Pipeline', value: `$${pipeline.toLocaleString()}`, color: 'text-blue-600' },
          { label: 'Won Revenue', value: `$${won.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Completion Rate', value: `${completionRate}%`, color: 'text-orange-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Job funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Status</h2>
        {totalJobs === 0 ? (
          <p className="text-gray-400 text-sm">No jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {(Object.keys(byStatus) as (keyof typeof byStatus)[]).map(status => {
              const count = byStatus[status].length
              const value = byStatus[status].reduce((s, j) => s + (j.estimate ?? 0), 0)
              const pct = totalJobs > 0 ? (count / totalJobs) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{statusLabels[status]}</span>
                    <span className="text-gray-500">
                      {count} job{count !== 1 ? 's' : ''}{value > 0 ? ` · $${value.toLocaleString()}` : ''}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[status]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Top clients */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Value</h2>
          {topClients.length === 0 ? (
            <p className="text-gray-400 text-sm">No estimates added yet.</p>
          ) : (
            <div className="space-y-3">
              {topClients.map(c => (
                <Link key={c.id} href={`/clients/${c.id}`} className="block group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 group-hover:text-slate-900">{c.name}</span>
                    <span className="text-green-700 font-medium">${c.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${(c.total / maxClientTotal) * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Follow-ups Needed
            {overdueFollowUps.length > 0 && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{overdueFollowUps.length}</span>
            )}
          </h2>
          {overdueFollowUps.length === 0 ? (
            <p className="text-gray-400 text-sm">All caught up!</p>
          ) : (
            <div className="space-y-2">
              {overdueFollowUps.map(c => (
                <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50">
                  <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {c.follow_up_date === today ? 'Today' : `Due ${c.follow_up_date}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All jobs table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Jobs</h2>
        {!jobs?.length ? (
          <p className="text-gray-400 text-sm">No jobs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 font-medium">Job</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-2 font-medium text-gray-800">{job.title}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        job.status === 'complete' ? 'bg-green-100 text-green-800' :
                        job.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {statusLabels[job.status]}
                      </span>
                    </td>
                    <td className="py-2 text-right text-green-700 font-medium">
                      {job.estimate ? `$${job.estimate.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={2} className="pt-2 text-sm font-semibold text-gray-700">Total Pipeline</td>
                  <td className="pt-2 text-right font-bold text-green-700">
                    ${(pipeline + won).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
