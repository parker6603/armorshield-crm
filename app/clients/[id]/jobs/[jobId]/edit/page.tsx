import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import JobForm from './JobForm'

export default async function EditJobPage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  if (!job) notFound()

  return <JobForm job={job} clientId={id} />
}
