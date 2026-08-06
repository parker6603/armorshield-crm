import Link from 'next/link'
import { Suspense } from 'react'
import { getAllClientsWithJobs } from '@/lib/data'
import SearchBar from '@/components/SearchBar'
import StatusFilter from '@/components/StatusFilter'
import SortControl from '@/components/SortControl'
import DashboardGreeting from '@/components/DashboardGreeting'
import { snoozeFollowUp, clearFollowUp } from './actions'

type JobStat = { id: string; status: string; estimate: number | null }

function isOverdue(date: string | null) {
  if (!date) return false
  return date < new Date().toISOString().split('T')[0]
}

function isDueToday(date: string | null) {
  if (!date) return false
  return date === new Date().toISOString().split('T')[0]
}

function isNewClient(created_at: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return new Date(created_at) > sevenDaysAgo
}

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  complete: 'bg-green-100 text-green-700',
}

const statusLabels: Record<string, string> = {
  lead: 'Lead',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  complete: 'Complete',
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; sort?: string }>
}) {
  const { search, status, sort = 'newest' } = await searchParams

  const allClients = await getAllClientsWithJobs()

  const allJobs = allClients.flatMap(c => (c.jobs ?? []) as JobStat[])

  const stats = {
    clients: allClients.length,
    active: allJobs.filter(j => j.status === 'in_progress').length,
    leads: allJobs.filter(j => j.status === 'lead').length,
    pipeline: allJobs
      .filter(j => j.status !== 'complete')
      .reduce((s, j) => s + (j.estimate ?? 0), 0),
    followUps: allClients.filter(
      c => isOverdue(c.follow_up_date) || isDueToday(c.follow_up_date)
    ).length,
  }

  const followUps = allClients.filter(
    c => isOverdue(c.follow_up_date) || isDueToday(c.follow_up_date)
  )

  // Filter
  let clients = allClients
  if (search) {
    const q = search.toLowerCase()
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.address ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q)
    )
  }
  if (status) {
    clients = clients.filter(c =>
      (c.jobs as JobStat[]).some(j => j.status === status)
    )
  }

  // Sort
  if (sort === 'name') {
    clients = [...clients].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'value') {
    clients = [...clients].sort((a, b) => {
      const aVal = (a.jobs as JobStat[]).reduce((s, j) => s + (j.estimate ?? 0), 0)
      const bVal = (b.jobs as JobStat[]).reduce((s, j) => s + (j.estimate ?? 0), 0)
      return bVal - aVal
    })
  } else if (sort === 'followup') {
    clients = [...clients].sort((a, b) => {
      if (!a.follow_up_date && !b.follow_up_date) return 0
      if (!a.follow_up_date) return 1
      if (!b.follow_up_date) return -1
      return a.follow_up_date.localeCompare(b.follow_up_date)
    })
  }

  const pipelineDisplay = stats.pipeline >= 10000
    ? `$${Math.round(stats.pipeline / 1000)}k`
    : `$${stats.pipeline.toLocaleString()}`

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Suspense>
          <DashboardGreeting />
        </Suspense>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Clients</p>
          <p className="text-3xl font-bold text-slate-700 mt-1 tabular-nums">{stats.clients}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">In Progress</p>
          <p className={`text-3xl font-bold mt-1 tabular-nums ${stats.active > 0 ? 'text-orange-600' : 'text-gray-300'}`}>
            {stats.active}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pipeline</p>
          <p className={`text-3xl font-bold mt-1 ${stats.pipeline > 0 ? 'text-green-600' : 'text-gray-300'}`}>
            {pipelineDisplay}
          </p>
        </div>
        <div className={`rounded-xl border p-4 ${stats.followUps > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Follow-ups</p>
          <p className={`text-3xl font-bold mt-1 tabular-nums ${stats.followUps > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
            {stats.followUps}
          </p>
        </div>
      </div>

      {/* Follow-up attention section */}
      {followUps.length > 0 && !search && !status && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-amber-100/60 border-b border-amber-200">
            <p className="text-amber-800 font-semibold text-sm">📞 Follow-ups needed</p>
          </div>
          <div className="divide-y divide-amber-100">
            {followUps.map((c) => {
              const snoozeAction = snoozeFollowUp.bind(null, c.id, 7)
              const clearAction = clearFollowUp.bind(null, c.id)
              return (
                <div key={c.id} className="flex items-center gap-2 px-4 py-3">
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-medium text-amber-900 hover:underline flex-1 min-w-0 truncate text-sm"
                  >
                    {c.name}
                  </Link>
                  <span className="text-xs text-amber-700 bg-white border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    {isDueToday(c.follow_up_date) ? 'Today' : 'Overdue'}
                  </span>
                  <form action={snoozeAction} className="flex-shrink-0">
                    <button type="submit" className="text-xs text-gray-600 border border-gray-200 bg-white px-2.5 py-1 rounded-lg hover:bg-gray-50">
                      Snooze 1 wk
                    </button>
                  </form>
                  <form action={clearAction} className="flex-shrink-0">
                    <button type="submit" className="text-xs text-green-700 border border-green-300 bg-white px-2.5 py-1 rounded-lg hover:bg-green-50 font-semibold">
                      ✓ Done
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search + filter row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
          <Suspense>
            <SortControl />
          </Suspense>
          <Link
            href="/clients/new"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm flex-shrink-0 hidden sm:inline-flex items-center"
          >
            + Add Client
          </Link>
        </div>
        <Suspense>
          <StatusFilter />
        </Suspense>
      </div>

      {/* Results count + mobile add */}
      <div className="flex items-center justify-between -mt-1">
        <p className="text-sm text-gray-400">
          {clients.length} client{clients.length !== 1 ? 's' : ''}{search || status ? ' found' : ''}
        </p>
        <Link href="/clients/new" className="sm:hidden bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm">
          + Add Client
        </Link>
      </div>

      {/* Client list */}
      {!clients.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">{search || status ? 'No clients match.' : 'No clients yet.'}</p>
          {!search && !status && (
            <p className="text-gray-400 mt-1 text-sm">Click <strong>+ Add Client</strong> to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => {
            const jobs = (client.jobs ?? []) as JobStat[]
            const total = jobs.reduce((s, j) => s + (j.estimate ?? 0), 0)
            const overdue = isOverdue(client.follow_up_date)
            const today = isDueToday(client.follow_up_date)
            const brandNew = isNewClient(client.created_at)

            const counts: Record<string, number> = {}
            jobs.forEach(j => { counts[j.status] = (counts[j.status] ?? 0) + 1 })
            const hasActive = jobs.some(j => j.status !== 'complete')
            const showStatuses = Object.entries(counts)
              .filter(([s]) => hasActive ? s !== 'complete' : true)
              .slice(0, 3)

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all group ${
                  overdue ? 'border-amber-300' : today ? 'border-amber-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 group-hover:text-slate-700">
                        {client.name}
                      </span>
                      {brandNew && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">New</span>
                      )}
                      {overdue && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚠️ Follow up</span>
                      )}
                      {!overdue && today && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">📅 Today</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 mt-0.5">
                      {client.phone && <span className="text-gray-500 text-sm">📞 {client.phone}</span>}
                      {client.address && <span className="text-gray-400 text-sm truncate max-w-xs">📍 {client.address}</span>}
                    </div>
                    {jobs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
                        {total > 0 && <span className="text-sm font-semibold text-green-700">${total.toLocaleString()}</span>}
                        {showStatuses.map(([s, count]) => (
                          <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s] ?? 'bg-gray-100 text-gray-600'}`}>
                            {count > 1 ? `${count}× ` : ''}{statusLabels[s] ?? s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
