'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateJobStatus } from '@/app/actions'

const statusStyles: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-300',
  complete: 'bg-green-100 text-green-800 border-green-300',
}

export default function QuickStatusUpdate({
  jobId,
  clientId,
  currentStatus,
}: {
  jobId: string
  clientId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    startTransition(async () => {
      await updateJobStatus(jobId, clientId, newStatus)
      router.refresh()
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs px-2 py-1 rounded-full font-medium border cursor-pointer appearance-none focus:outline-none transition-opacity ${statusStyles[currentStatus] ?? 'bg-gray-100 text-gray-700 border-gray-300'} ${isPending ? 'opacity-40' : ''}`}
    >
      <option value="lead">Lead</option>
      <option value="scheduled">Scheduled</option>
      <option value="in_progress">In Progress</option>
      <option value="complete">Complete</option>
    </select>
  )
}
