import { notFound } from 'next/navigation'
import { getJob } from '@/lib/data'
import JobForm from './JobForm'

export default async function EditJobPage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params
  const job = await getJob(jobId)
  if (!job) notFound()

  return <JobForm job={job} clientId={id} />
}
