'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { deleteFile } from '@/app/actions'

type File = {
  id: string
  name: string
  path: string
  size: number | null
  created_at: string
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileList({ clientId, files }: { clientId: string; files: File[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(file: File) {
    if (!confirm(`Delete "${file.name}"?`)) return
    setDeleting(file.id)
    await deleteFile(clientId, file.id, file.path)
    setDeleting(null)
    router.refresh()
  }

  async function getUrl(path: string) {
    const { data } = supabase.storage.from('documents').getPublicUrl(path)
    window.open(data.publicUrl, '_blank')
  }

  if (!files.length) return null

  return (
    <div className="mt-3 space-y-1">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <button onClick={() => getUrl(file.path)} className="text-slate-700 hover:underline truncate max-w-xs text-left">
            {file.name}
          </button>
          {file.size && <span className="text-gray-400 text-xs">{formatSize(file.size)}</span>}
          <button
            onClick={() => handleDelete(file)}
            disabled={deleting === file.id}
            className="text-red-400 hover:text-red-600 ml-auto shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
