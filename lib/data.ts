import { cacheTag, cacheLife } from 'next/cache'
import { supabase } from './supabase'

export async function getAllClientsWithJobs() {
  'use cache'
  cacheTag('clients')
  cacheLife('minutes')
  const { data } = await supabase
    .from('clients')
    .select('*, jobs(id, status, estimate)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllJobs() {
  'use cache'
  cacheTag('jobs')
  cacheLife('minutes')
  const { data } = await supabase
    .from('jobs')
    .select('*, clients(id, name, address)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getClient(id: string) {
  'use cache'
  cacheTag(`client-${id}`)
  cacheTag('clients')
  cacheLife('minutes')
  const { data } = await supabase.from('clients').select('*').eq('id', id).single()
  return data
}

export async function getClientJobs(clientId: string) {
  'use cache'
  cacheTag(`client-jobs-${clientId}`)
  cacheTag('jobs')
  cacheLife('minutes')
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getClientFiles(clientId: string) {
  'use cache'
  cacheTag(`client-files-${clientId}`)
  cacheLife('minutes')
  const { data } = await supabase
    .from('files')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getJob(jobId: string) {
  'use cache'
  cacheTag(`job-${jobId}`)
  cacheTag('jobs')
  cacheLife('minutes')
  const { data } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  return data
}

export async function getAnalyticsData() {
  'use cache'
  cacheTag('clients')
  cacheTag('jobs')
  cacheLife('minutes')
  const [{ data: clients }, { data: jobs }] = await Promise.all([
    supabase.from('clients').select('id, name, follow_up_date, jobs(estimate, status)'),
    supabase.from('jobs').select('*'),
  ])
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    }
  })
  return { clients: clients ?? [], jobs: jobs ?? [], today, months }
}
