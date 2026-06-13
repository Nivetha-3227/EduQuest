CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
