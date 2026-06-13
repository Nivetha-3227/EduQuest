CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  raw_content TEXT,                  
  file_url TEXT,                     
  summary TEXT,                      
  status TEXT DEFAULT 'pending'      
    CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,            
  correct_option INT NOT NULL,       
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);