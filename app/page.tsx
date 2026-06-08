import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/lib/supabase'

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  complete: 'bg-green-100 text-green-800',
}

export default async function Dashboard() {
  const { data: clients } = await supabase
    .from('clients')
    .select('*, jobs(status)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link
          href="/clients/new"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-medium"
        >
          + Add Client
        </Link>
      </div>

      {!clients?.length ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No clients yet.</p>
          <p className="mt-1">Click <strong>+ Add Client</strong> to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client: Client & { jobs: { status: string }[] }) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">{client.name}</h2>
                  {client.phone && <p className="text-gray-500 text-sm mt-0.5">{client.phone}</p>}
                  {client.address && <p className="text-gray-400 text-sm">{client.address}</p>}
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
          ))}
        </div>
      )}
    </div>
  )
}
