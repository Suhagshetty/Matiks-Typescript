import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// First names pool for username generation
const firstNames = [
  'rahul', 'amit', 'priya', 'neha', 'arjun', 'kavya', 'rohan', 'ananya', 'vikram', 'meera',
  'aditya', 'shreya', 'karan', 'pooja', 'nikhil', 'ishita', 'raj', 'divya', 'varun', 'tanya',
  'alex', 'emma', 'james', 'sophia', 'oliver', 'ava', 'william', 'mia', 'benjamin', 'luna',
  'lucas', 'harper', 'henry', 'evelyn', 'ethan', 'abigail', 'sebastian', 'ella', 'jack', 'scarlett',
  'daniel', 'grace', 'matthew', 'chloe', 'joseph', 'zoey', 'david', 'lily', 'andrew', 'hannah',
  'ninja', 'ghost', 'shadow', 'blade', 'storm', 'phoenix', 'dragon', 'wolf', 'hawk', 'viper',
  'cyber', 'nova', 'pulse', 'flux', 'quantum', 'pixel', 'byte', 'zero', 'alpha', 'omega',
  'pro', 'elite', 'master', 'legend', 'champ', 'king', 'queen', 'ace', 'star', 'titan'
]

// Last name suffixes
const suffixes = [
  '', '_gaming', '_pro', '_gg', '_plays', '_ttv', '_live', '_official', '_real', '_x',
  '_2024', '_yt', '_streams', '_esports', '_team', '_squad', '_clan', '_crew', '_army', '_nation',
  '123', '007', '99', '42', '777', '420', '69', '1337', '2000', '3000',
  '_burman', '_sharma', '_kumar', '_mathur', '_gupta', '_singh', '_patel', '_reddy', '_rao', '_jain',
  '_smith', '_johnson', '_williams', '_brown', '_jones', '_davis', '_miller', '_wilson', '_moore', '_taylor'
]

function generateUsername(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  const randomNum = Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : ''
  return `${firstName}${suffix}${randomNum}`.toLowerCase()
}

function generateRating(): number {
  // Generate rating with a bell curve distribution (more users in middle ranges)
  const mean = 2500
  const stdDev = 900
  
  let rating = Math.round(mean + (Math.random() + Math.random() + Math.random() - 1.5) * stdDev)
  
  // Clamp between 100 and 5000
  return Math.max(100, Math.min(5000, rating))
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check current user count
    const { count: existingCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    console.log(`Current user count: ${existingCount}`)

    if (existingCount && existingCount >= 10000) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Already have ${existingCount} users. No seeding needed.`,
          count: existingCount 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetCount = 10000
    const usersToCreate = targetCount - (existingCount || 0)
    const batchSize = 500
    let createdCount = 0
    const usedUsernames = new Set<string>()

    console.log(`Creating ${usersToCreate} users...`)

    for (let i = 0; i < usersToCreate; i += batchSize) {
      const batch = []
      const currentBatchSize = Math.min(batchSize, usersToCreate - i)

      for (let j = 0; j < currentBatchSize; j++) {
        let username = generateUsername()
        let attempts = 0
        
        // Ensure uniqueness within this seeding session
        while (usedUsernames.has(username) && attempts < 100) {
          username = generateUsername() + Math.floor(Math.random() * 10000)
          attempts++
        }
        
        usedUsernames.add(username)
        batch.push({
          username,
          rating: generateRating()
        })
      }

      const { error } = await supabase.from('users').insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i}:`, error)
        // Continue with next batch even if one fails
      } else {
        createdCount += batch.length
        console.log(`Inserted batch ${i / batchSize + 1}, total created: ${createdCount}`)
      }
    }

    // Get final count
    const { count: finalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully seeded database`,
        created: createdCount,
        total: finalCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Seeding error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
