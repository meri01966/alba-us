const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oairchbitlanpzywncua.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('Verificando tablas...')
  
  // Check planificaciones
  const { data: p, error: pe } = await supabase.from('planificaciones').select('id').limit(1)
  console.log('planificaciones:', pe ? `ERROR: ${pe.message} (${pe.code})` : 'OK')
  
  // Check seguimiento  
  const { data: s, error: se } = await supabase.from('seguimiento').select('id').limit(1)
  console.log('seguimiento:', se ? `ERROR: ${se.message} (${se.code})` : 'OK')
  
  // Check alumnos
  const { data: a, error: ae } = await supabase.from('alumnos').select('id').limit(1)
  console.log('alumnos:', ae ? `ERROR: ${ae.message} (${ae.code})` : 'OK')
  
  // Check registro_cierre
  const { data: r, error: re } = await supabase.from('registro_cierre').select('id').limit(1)
  console.log('registro_cierre:', re ? `ERROR: ${re.message} (${re.code})` : 'OK')
}

checkTables()
