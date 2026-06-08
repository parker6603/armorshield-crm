import Link from 'next/link'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  complete: 'bg-green-100 text-green-800',
}

function isOverdue(date: string | null) {
  if (!date) return false
  return new Date(date) < new Date(new Date().toDateString())
}

function isDueToday(date: string | null) {
  if (!date) return false
  return new Date(date).toDateString() === new Date().toDateString()
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams

  let query = supabase
    .from('clients')
    .select('*, jobs(status, estimate)')
    .order('follow_up_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: clients } = await query

  const followUps = clients?.filter(
    (c) => isOverdue(c.follow_up_date) || isDueToday(c.follow_up_date)
  ) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Link
            href="/clients/new"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium text-sm"
          >
            + Add Client
          </Link>
        </div>
      </div>

      {followUps.length > 0 && !search && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 font-semibold text-sm mb-2">📞 Follow-ups needed</p>
          <div className="space-y-1">
            {followUps.map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between hover:bg-amber-100 rounded-lg px-2 py-1">
                <span className="text-amber-900 font-medium">{c.name}</span>
                <span className="text-amber-700 text-xs">
                  {isDueToday(c.follow_up_date) ? 'Today' : `Overdue: ${c.follow_up_date}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!clients?.length ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">{search ? `No clients found for "${search}"` : 'No clients yet.'}</p>
          {!search && <p className="mt-1">Click <strong>+ Add Client</strong> to get started.</p>}
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => {
            const total = client.jobs?.reduce((sum: number, j: { estimate: number | null }) => sum + (j.estimate ?? 0), 0) ?? 0
            const overdue = isOverdue(client.follow_up_date)
            const today = isDueToday(client.follow_up_date)

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${overdue ? 'border-amber-300' : today ? 'border-amber-200' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900 text-lg">{client.name}</h2>
                      {(overdue || today) && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {today ? 'Follow up today' : 'Follow up overdue'}
                        </span>
                      )}
                    </div>
                    {client.phone && <p className="text-gray-500 text-sm mt-0.5">{client.phone}</p>}
                    {client.address && <p className="text-gray-400 text-sm">{client.address}</p>}
                    {total > 0 && (
                      <p className="text-green-700 font-medium text-sm mt-1">
                        ${total.toLocaleString()} total estimated
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {client.jobs?.map((job: { status: string }, i: number) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
