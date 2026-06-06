-- Tabla para mensajes de la directora a las salas
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS mensajes_directora (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  leido_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para buscar por sala
CREATE INDEX IF NOT EXISTS idx_mensajes_sala ON mensajes_directora(sala);

-- Habilitar RLS
ALTER TABLE mensajes_directora ENABLE ROW LEVEL SECURITY;

-- Politica para permitir todo (ajustar segun necesidad)
CREATE POLICY "Allow all" ON mensajes_directora FOR ALL USING (true) WITH CHECK (true);
