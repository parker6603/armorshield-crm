'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SortControl() {
  const router = useRouter()
  const sp = useSearchParams()
  const current = sp.get('sort') ?? 'newest'

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString())
    if (e.target.value && e.target.value !== 'newest') {
      params.set('sort', e.target.value)
    } else {
      params.delete('sort')
    }
    const qs = params.toString()
    router.push(qs ? `?${qs}` : window.location.pathname)
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-slate-400 flex-shrink-0"
    >
      <option value="newest">Newest</option>
      <option value="name">Name A–Z</option>
      <option value="value">Highest value</option>
      <option value="followup">Follow-up soon</option>
    </select>
  )
}
