const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

async function checkCierres() {
  // Check all registro_cierre
  const { data: all, error } = await supabase
    .from("registro_cierre")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)
  
  console.log("Ultimos 10 registro_cierre:")
  if (all) {
    all.forEach(r => {
      console.log(`  - sala: ${r.sala}, eje: ${r.eje}, fecha: ${r.fecha}, id: ${r.id}`)
    })
  }
  console.log("Error:", error?.message)
  
  // Check SALADEPRUEBA specifically
  const { data: sala, count } = await supabase
    .from("registro_cierre")
    .select("*", { count: "exact" })
    .eq("sala", "SALADEPRUEBA")
  
  console.log("\nSALADEPRUEBA cierres:", count)
  if (sala) {
    sala.forEach(r => {
      console.log(`  - eje: ${r.eje}, fecha: ${r.fecha}`)
    })
  }
}

checkCierres()
