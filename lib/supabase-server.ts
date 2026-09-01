import { createClient } from '@supabase/supabase-js'

// Cliente del servidor - usa la misma anon key que el cliente
// Las operaciones del server no necesitan bypass RLS para este proyecto
const supabaseUrl = 'https://ehwlulqcwimatxmnajra.supabase.co'
const supabaseAnonKey = 'sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1'

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
