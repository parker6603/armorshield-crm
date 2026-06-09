'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { appendNote } from '@/app/actions'

export default function NoteLogger({ clientId }: { clientId: string }) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit() {
    if (!note.trim()) return
    const text = note.trim()
    startTransition(async () => {
      await appendNote(clientId, text)
      setNote('')
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Log a note... e.g., Called client — scheduled for Thursday. Left voicemail."
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none placeholder-gray-300"
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={handleSubmit}
          disabled={isPending || !note.trim()}
          className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isPending ? 'Saving…' : '+ Log Note'}
        </button>
        <span className="text-xs text-gray-400">or ⌘↵</span>
        {saved && (
          <span className="text-xs text-green-600 font-medium animate-pulse">✓ Saved</span>
        )}
      </div>
    </div>
  )
}
