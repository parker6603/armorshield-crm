import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ClientForm from './ClientForm'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!client) notFound()

  return <ClientForm client={client} />
}
