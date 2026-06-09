'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { snoozeFollowUp, clearFollowUp } from '@/app/actions'

const PRESETS = [
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
]

export default function FollowUpQuickSet({
  clientId,
  hasFollowUp,
}: {
  clientId: string
  hasFollowUp: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function setDays(days: number) {
    startTransition(async () => {
      await snoozeFollowUp(clientId, days)
      router.refresh()
    })
  }

  function clearDate() {
    startTransition(async () => {
      await clearFollowUp(clientId)
      router.refresh()
    })
  }

  return (
    <div className={`flex items-center gap-1.5 flex-wrap transition-opacity ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
      <span className="text-xs text-gray-400 font-medium mr-0.5">Set follow-up:</span>
      {PRESETS.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => setDays(days)}
          className="text-xs border border-gray-200 px-2.5 py-1 rounded-full hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 text-gray-500 transition-colors"
        >
          {label}
        </button>
      ))}
      {hasFollowUp && (
        <button
          onClick={clearDate}
          className="text-xs border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-50 text-red-500 transition-colors"
        >
          ✕ Clear
        </button>
      )}
    </div>
  )
}
