import { createClient } from '@supabase/supabase-js'

// Cliente del servidor - usa la misma anon key que el cliente
// Las operaciones del server no necesitan bypass RLS para este proyecto
const supabaseUrl = 'https://oairchbitlanpzywncua.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA'

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
