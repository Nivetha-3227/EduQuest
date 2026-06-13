
CREATE OR REPLACE FUNCTION increment_session_score(
  p_session_id UUID, p_points INT
) RETURNS VOID AS $$
  UPDATE room_sessions
  SET total_score = total_score + p_points
  WHERE id = p_session_id;
$$ LANGUAGE SQL;


CREATE OR REPLACE FUNCTION refresh_leaderboard(p_room_id UUID)
RETURNS VOID AS $$
  INSERT INTO leaderboard_snapshots (room_id, user_id, username, score, rank, updated_at)
  SELECT
    rs.room_id,
    rs.user_id,
    p.username,
    rs.total_score,
    RANK() OVER (ORDER BY rs.total_score DESC),
    NOW()
  FROM room_sessions rs
  JOIN profiles p ON p.id = rs.user_id
  WHERE rs.room_id = p_room_id AND rs.is_disqualified = FALSE
  ON CONFLICT (room_id, user_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    rank = EXCLUDED.rank,
    updated_at = NOW();
$$ LANGUAGE SQL;