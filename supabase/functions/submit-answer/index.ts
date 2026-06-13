// supabase/functions/submit-answer/index.ts
Deno.serve(async (req) => {
  const { session_id, puzzle_id, selected_option, time_taken_seconds } =
    await req.json();

  // 1. Fetch puzzle + correct answer
  const { data: puzzle } = await supabase
    .from("room_puzzles")
    .select("*, questions(*)")
    .eq("id", puzzle_id)
    .single();

  const is_correct =
    puzzle.questions.correct_option === selected_option;

  // 2. Calculate points (speed bonus: faster = more points)
  const base_points = puzzle.points_value;
  const speed_bonus = Math.max(0, 50 - time_taken_seconds);
  const points_awarded = is_correct ? base_points + speed_bonus : 0;

  // 3. Log attempt
  await supabase.from("puzzle_attempts").insert({
    session_id, puzzle_id, selected_option,
    is_correct, time_taken_seconds, points_awarded,
  });

  // 4. Update session score
  if (is_correct) {
    await supabase.rpc("increment_session_score", {
      p_session_id: session_id,
      p_points: points_awarded,
    });
  }

  // 5. Update leaderboard snapshot
  await supabase.rpc("refresh_leaderboard", {
    p_room_id: puzzle.room_id,
  });

  return new Response(JSON.stringify({ is_correct, points_awarded }), {
    headers: { "Content-Type": "application/json" },
  });
});