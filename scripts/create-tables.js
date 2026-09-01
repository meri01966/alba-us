const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ehwlulqcwimatxmnajra.supabase.co'
const supabaseKey = 'sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1'

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
