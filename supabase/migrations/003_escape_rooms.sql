CREATE TABLE escape_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL,               
  description TEXT,
  time_limit_seconds INT NOT NULL,   
  max_participants INT DEFAULT 50,
  status TEXT DEFAULT 'lobby'
    CHECK (status IN ('lobby', 'active', 'completed', 'cancelled')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  quiz_id UUID REFERENCES quizzes(id), 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE room_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES escape_rooms(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  puzzle_order INT NOT NULL,         
  clue_text TEXT,                    
  points_value INT DEFAULT 100,
  unlock_after_puzzle_id UUID REFERENCES room_puzzles(id) 
);