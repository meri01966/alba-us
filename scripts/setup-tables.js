// Script para crear tablas faltantes en Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables SUPABASE')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
  console.log('Creando tabla planificaciones...')
  
  // Intentar crear via RPC o insertar un registro de prueba para ver el error
  const { error } = await supabase.from('planificaciones').select('id').limit(1)
  
  if (error && error.code === '42P01') {
    console.log('Tabla planificaciones no existe. Necesitas crearla en Supabase Dashboard:')
    console.log(`
CREATE TABLE planificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  sala TEXT NOT NULL,
  titulo TEXT,
  objetivo TEXT,
  actividad TEXT,
  recursos TEXT,
  contenido_maestra TEXT,
  sugerencia_alba TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_planificaciones_sala ON planificaciones(sala);
CREATE INDEX idx_planificaciones_fecha ON planificaciones(fecha);
    `)
  } else if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Tabla planificaciones existe OK')
  }

  // Verificar tabla seguimiento
  const { error: err2 } = await supabase.from('seguimiento').select('id').limit(1)
  if (err2 && err2.code === '42P01') {
    console.log('Tabla seguimiento no existe. Necesitas crearla:')
    console.log(`
CREATE TABLE seguimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES alumnos(id),
  eje TEXT NOT NULL,
  estado TEXT NOT NULL,
  progreso INTEGER DEFAULT 0,
  sala TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seguimiento_alumno ON seguimiento(alumno_id);
CREATE INDEX idx_seguimiento_sala ON seguimiento(sala);
    `)
  } else if (err2) {
    console.log('Error seguimiento:', err2.message)
  } else {
    console.log('Tabla seguimiento existe OK')
  }
}

setup()
