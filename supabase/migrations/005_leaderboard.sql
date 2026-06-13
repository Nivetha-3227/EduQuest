CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES escape_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT,
  score INT DEFAULT 0,
  rank INT,
  completion_time_seconds INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);