import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get how many users to update (default: 50)
    const { count: updateCount = 50 } = await req.json().catch(() => ({}))

    // Get random users to update
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, rating')
      .limit(updateCount * 2)

    if (fetchError) {
      throw fetchError
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No users to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Randomly select users to update
    const shuffled = users.sort(() => Math.random() - 0.5).slice(0, updateCount)
    
    let updatedCount = 0
    const updates = []

    for (const user of shuffled) {
      // Generate rating change: -100 to +100
      const change = Math.floor(Math.random() * 201) - 100
      let newRating = user.rating + change
      
      // Clamp between 100 and 5000
      newRating = Math.max(100, Math.min(5000, newRating))
      
      updates.push({
        id: user.id,
        oldRating: user.rating,
        newRating
      })
    }

    // Perform updates
    for (const update of updates) {
      const { error } = await supabase
        .from('users')
        .update({ rating: update.newRating })
        .eq('id', update.id)
      
      if (!error) {
        updatedCount++
      }
    }

    console.log(`Updated ${updatedCount} user ratings`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${updatedCount} ratings`,
        updated: updatedCount,
        samples: updates.slice(0, 5)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Update ratings error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
