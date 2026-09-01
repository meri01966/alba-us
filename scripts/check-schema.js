const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  "https://ehwlulqcwimatxmnajra.supabase.co",
  "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"
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
  
  // Check Kindergarten specifically
  const { data: sala, count } = await supabase
    .from("registro_cierre")
    .select("*", { count: "exact" })
    .eq("sala", "Kindergarten")
  
  console.log("\nKindergarten cierres:", count)
  if (sala) {
    sala.forEach(r => {
      console.log(`  - eje: ${r.eje}, fecha: ${r.fecha}`)
    })
  }
}

checkCierres()
