import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  follow_up_date: string | null
  created_at: string
}

export type Job = {
  id: string
  client_id: string
  title: string
  status: 'lead' | 'scheduled' | 'in_progress' | 'complete'
  description: string | null
  estimate: number | null
  notes: string | null
  photo_link: string | null
  created_at: string
}
