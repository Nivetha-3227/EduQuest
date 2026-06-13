import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtbzgfuxqlskcikbezls.supabase.co',
  'sb_publishable_GM5SpjVWV-rWpxEhOWQNvQ_fdIkp-xU'
)

supabase
  .channel('leaderboard-test')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'leaderboard_snapshots'
    },
    (payload) => {
      console.log('Leaderboard changed:', payload)
    }
  )
  .subscribe((status) => {
  console.log('STATUS:', status)
})

supabase
  .channel('rooms-test')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'escape_rooms'
    },
    (payload) => {
      console.log('Room changed:', payload)
    }
  )
  .subscribe((status) => {
  console.log('STATUS:', status)
})

supabase
  .channel('sessions-test')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'room_sessions'
    },
    (payload) => {
      console.log('Session changed:', payload)
    }
  )
  .subscribe((status) => {
  console.log('STATUS:', status)
})

console.log('Listening...')