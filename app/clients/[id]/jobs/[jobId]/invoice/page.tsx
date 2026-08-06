import { notFound } from 'next/navigation'
import { getClient, getJob } from '@/lib/data'
import InvoiceEditor from './InvoiceEditor'

export default async function InvoicePage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params

  const [client, job] = await Promise.all([
    getClient(id),
    getJob(jobId),
  ])

  if (!client || !job) notFound()

  const invoiceNumber = `INV-${jobId.slice(0, 8).toUpperCase()}`
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <InvoiceEditor
      invoiceNumber={invoiceNumber}
      today={today}
      dueDate={dueDate}
      clientName={client.name ?? ''}
      clientAddress={client.address ?? ''}
      clientPhone={client.phone ?? ''}
      clientEmail={client.email ?? ''}
      jobTitle={job.title ?? ''}
      jobDescription={job.description ?? ''}
      jobNotes={job.notes ?? ''}
      jobEstimate={job.estimate ?? null}
      backHref={`/clients/${id}`}
    />
  )
}
