import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: clients } = await supabase
    .from('clients')
    .select('*, jobs(title, status, estimate)')
    .order('name')

  if (!clients?.length) {
    return new NextResponse('No data', { status: 404 })
  }

  const escape = (s: string | null | undefined) =>
    `"${(s ?? '').replace(/"/g, '""')}"`

  const header = [
    'Name', 'Phone', 'Email', 'Address', 'Follow-up Date',
    'Total Jobs', 'Total Estimated ($)',
    'Leads', 'Scheduled', 'In Progress', 'Complete',
  ].map(escape).join(',')

  const rows = clients.map(c => {
    const jobs = (c.jobs ?? []) as { status: string; estimate: number | null }[]
    const total = jobs.reduce((s, j) => s + (j.estimate ?? 0), 0)
    return [
      escape(c.name),
      escape(c.phone),
      escape(c.email),
      escape(c.address),
      c.follow_up_date ?? '',
      jobs.length,
      total,
      jobs.filter(j => j.status === 'lead').length,
      jobs.filter(j => j.status === 'scheduled').length,
      jobs.filter(j => j.status === 'in_progress').length,
      jobs.filter(j => j.status === 'complete').length,
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')
  const today = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="armorshield-clients-${today}.csv"`,
    },
  })
}
