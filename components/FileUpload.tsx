'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FileUpload({ clientId, jobId }: { clientId: string; jobId?: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = jobId
      ? `${clientId}/${jobId}/${Date.now()}-${safeName}`
      : `${clientId}/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase.from('files').insert({
      client_id: clientId,
      job_id: jobId ?? null,
      name: file.name,
      path,
      size: file.size,
    })

    if (dbError) {
      setError(dbError.message)
    } else {
      if (fileRef.current) fileRef.current.value = ''
      if (photoRef.current) photoRef.current.value = ''
      router.refresh()
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

      <label className={btnClass}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {uploading ? 'Uploading...' : 'Take photo'}
        <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {error && <p className="text-red-500 text-xs mt-1 w-full">{error}</p>}
    </div>
  )
}
