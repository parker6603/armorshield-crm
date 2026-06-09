'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    startTransition(() => {
      if (value) {
        router.push(`/?search=${encodeURIComponent(value)}`)
      } else {
        router.push('/')
      }
    })
  }

  return (
    <input
      type="search"
      placeholder="Search clients..."
      defaultValue={searchParams.get('search') ?? ''}
      onChange={handleChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-slate-500"
    />
  )
}
