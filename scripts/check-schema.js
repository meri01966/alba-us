const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

async function checkSchema() {
  // Insert seguimiento with sala
  const { data: s1, error: e1 } = await supabase
    .from("seguimiento")
    .insert({ 
      alumno_id: "4afba6b4-a609-440b-963e-7ddd0a1d72ea",
      eje: "CF",
      estado: "green",
      sala: "SALADEPRUEBA",
      fecha: new Date().toISOString()
    })
    .select()
  console.log("SEGUIMIENTO insert:", s1, e1?.message)
  
  // Insert registro_cierre
  const { data: r1, error: r1e } = await supabase
    .from("registro_cierre")
    .insert({ 
      sala: "SALADEPRUEBA",
      eje: "CF",
      fecha: new Date().toISOString()
    })
    .select()
  console.log("REGISTRO_CIERRE insert:", r1, r1e?.message)
  
  // Count
  const { count: c1 } = await supabase.from("seguimiento").select("*", { count: "exact", head: true })
  const { count: c2 } = await supabase.from("registro_cierre").select("*", { count: "exact", head: true })
  console.log("Counts:", c1, c2)
}

checkSchema()
