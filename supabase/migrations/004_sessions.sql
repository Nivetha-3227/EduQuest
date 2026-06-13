CREATE TABLE room_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES escape_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_score INT DEFAULT 0,
  is_disqualified BOOL DEFAULT FALSE,
  tab_switch_count INT DEFAULT 0,
  UNIQUE(room_id, user_id)
);

CREATE TABLE puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES room_sessions(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES room_puzzles(id),
  selected_option INT,
  is_correct BOOL,
  time_taken_seconds INT,
  points_awarded INT DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE integrity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES room_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,          
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);