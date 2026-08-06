import { notFound } from 'next/navigation'
import { getClient, getJob } from '@/lib/data'
import EstimateEditor from './EstimateEditor'

export default async function EstimatePage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params

  const [client, job] = await Promise.all([
    getClient(id),
    getJob(jobId),
  ])

  if (!client || !job) notFound()

  const estimateNumber = `AS-${jobId.slice(0, 8).toUpperCase()}`
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <EstimateEditor
      estimateNumber={estimateNumber}
      today={today}
      validUntil={validUntil}
      clientName={client.name ?? ''}
      clientAddress={client.address ?? ''}
      clientPhone={client.phone ?? ''}
      clientEmail={client.email ?? ''}
      jobTitle={job.title ?? ''}
      jobDescription={job.description ?? ''}
      jobNotes={job.notes ?? ''}
      backHref={`/clients/${id}`}
    />
  )
}
