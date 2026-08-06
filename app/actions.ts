'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export async function createClient(formData: FormData) {
  const { error } = await supabase.from('clients').insert({
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    address: (formData.get('address') as string) || null,
    notes: (formData.get('notes') as string) || null,
    follow_up_date: (formData.get('follow_up_date') as string) || null,
  })
  if (error) throw new Error(error.message)
  revalidateTag('clients', 'max')
  redirect('/')
}

export async function updateClient(id: string, formData: FormData) {
  const { error } = await supabase.from('clients').update({
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    address: (formData.get('address') as string) || null,
    notes: (formData.get('notes') as string) || null,
    follow_up_date: (formData.get('follow_up_date') as string) || null,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('clients', 'max')
  revalidateTag(`client-${id}`, 'max')
  redirect(`/clients/${id}`)
}

export async function deleteClient(id: string) {
  await supabase.from('jobs').delete().eq('client_id', id)
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateTag('clients', 'max')
  revalidateTag('jobs', 'max')
  redirect('/')
}

export async function createJob(clientId: string, formData: FormData) {
  const { error } = await supabase.from('jobs').insert({
    client_id: clientId,
    title: formData.get('title') as string,
    status: formData.get('status') as string,
    description: (formData.get('description') as string) || null,
    estimate: formData.get('estimate') ? Number(formData.get('estimate')) : null,
    notes: (formData.get('notes') as string) || null,
    photo_link: (formData.get('photo_link') as string) || null,
  })
  if (error) throw new Error(error.message)
  revalidateTag('jobs', 'max')
  revalidateTag('clients', 'max')
  revalidateTag(`client-jobs-${clientId}`, 'max')
  redirect(`/clients/${clientId}`)
}

export async function updateJob(jobId: string, clientId: string, formData: FormData) {
  const { error } = await supabase.from('jobs').update({
    title: formData.get('title') as string,
    status: formData.get('status') as string,
    description: (formData.get('description') as string) || null,
    estimate: formData.get('estimate') ? Number(formData.get('estimate')) : null,
    notes: (formData.get('notes') as string) || null,
    photo_link: (formData.get('photo_link') as string) || null,
  }).eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidateTag('jobs', 'max')
  revalidateTag('clients', 'max')
  revalidateTag(`job-${jobId}`, 'max')
  revalidateTag(`client-jobs-${clientId}`, 'max')
  redirect(`/clients/${clientId}`)
}

export async function deleteJob(jobId: string, clientId: string) {
  const { error } = await supabase.from('jobs').delete().eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidateTag('jobs', 'max')
  revalidateTag('clients', 'max')
  revalidateTag(`job-${jobId}`, 'max')
  revalidateTag(`client-jobs-${clientId}`, 'max')
  redirect(`/clients/${clientId}`)
}

export async function updateJobStatus(jobId: string, clientId: string, status: string) {
  const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId)
  if (error) throw new Error(error.message)
  revalidateTag('jobs', 'max')
  revalidateTag('clients', 'max')
  revalidateTag(`job-${jobId}`, 'max')
  revalidateTag(`client-jobs-${clientId}`, 'max')
}

export async function snoozeFollowUp(clientId: string, days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const dateStr = d.toISOString().split('T')[0]
  const { error } = await supabase.from('clients').update({ follow_up_date: dateStr }).eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidateTag('clients', 'max')
  revalidateTag(`client-${clientId}`, 'max')
}

export async function clearFollowUp(clientId: string) {
  const { error } = await supabase.from('clients').update({ follow_up_date: null }).eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidateTag('clients', 'max')
  revalidateTag(`client-${clientId}`, 'max')
}

export async function appendNote(clientId: string, note: string) {
  if (!note.trim()) return
  const { data } = await supabase.from('clients').select('notes').eq('id', clientId).single()
  const stamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const existing = data?.notes ?? ''
  const updated = existing ? `${existing}\n\n[${stamp}] ${note.trim()}` : `[${stamp}] ${note.trim()}`
  const { error } = await supabase.from('clients').update({ notes: updated }).eq('id', clientId)
  if (error) throw new Error(error.message)
  revalidateTag(`client-${clientId}`, 'max')
  revalidatePath(`/clients/${clientId}`)
}
