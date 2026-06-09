'use client'

import { useState, useEffect } from 'react'

export default function DashboardGreeting() {
  const [line, setLine] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })
    setLine(`${greeting}, Parker 👋  ·  ${today}`)
  }, [])

  if (!line) return null
  return <p className="text-sm text-gray-500 -mt-1 mb-1">{line}</p>
}
