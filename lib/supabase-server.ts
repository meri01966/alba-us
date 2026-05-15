import { createClient } from '@supabase/supabase-js'

// Cliente del servidor con service_role key (bypass RLS)
// Solo usar en API routes, nunca en el cliente/navegador
const supabaseUrl = 'https://oairchbitlanpzywncua.supabase.co'
const supabaseServiceKey = 'sb_secret_LyML0Qjo3eDXzjHe0EGaxA_2xpSabDX'

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
