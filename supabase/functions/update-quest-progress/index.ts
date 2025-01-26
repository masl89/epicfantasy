import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DIFFICULTY_RATES = {
  easy: 10,
  medium: 5,
  hard: 3,
  epic: 1
}

Deno.serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active working quests
    const { data: activeQuests, error: questsError } = await supabaseClient
      .from('player_quests')
      .select(`
        *,
        quest:quests(difficulty)
      `)
      .eq('is_working', true)
      .neq('status', 'completed')
      .lt('progress', 100)

    if (questsError) throw questsError

    // Update each quest's progress
    for (const quest of activeQuests) {
      const progressRate = DIFFICULTY_RATES[quest.quest.difficulty] || 5
      const newProgress = Math.min(100, quest.progress + progressRate)

      // Update progress
      const { error: updateError } = await supabaseClient
        .from('player_quests')
        .update({ 
          progress: newProgress,
          is_working: newProgress < 100 // Stop working if completed
        })
        .eq('id', quest.id)

      if (updateError) throw updateError

      // Log significant progress (25% intervals)
      if (Math.floor(quest.progress / 25) < Math.floor(newProgress / 25)) {
        await supabaseClient
          .from('activity_log')
          .insert({
            profile_id: quest.profile_id,
            activity_type: 'quest_progress',
            description: `Made progress on quest (${newProgress}%)`
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 