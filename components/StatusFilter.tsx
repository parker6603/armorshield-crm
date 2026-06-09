'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: '', label: 'All' },
  { value: 'lead', label: 'Leads' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'Active' },
  { value: 'complete', label: 'Complete' },
]

export default function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? ''

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    const qs = params.toString()
    router.push(qs ? `?${qs}` : window.location.pathname)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
            current === opt.value
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
