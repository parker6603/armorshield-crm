'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/app/actions'

export default function FileUpload({ clientId, jobId }: { clientId: string; jobId?: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await uploadFile(clientId, jobId ?? null, formData)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }

    setUploading(false)
  }

  const btnClass = `inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:border-slate-400 hover:text-slate-600 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`

  return (
    <div className="flex gap-2 flex-wrap">
      <label className={btnClass}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Uploading...' : 'Upload file'}
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

{error && <p className="text-red-500 text-xs mt-1 w-full">{error}</p>}
    </div>
  )
}
