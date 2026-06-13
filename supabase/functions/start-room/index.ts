import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


interface StartRoomPayload {
  room_id: string;
  started_by: string; // user_id of whoever is triggering the start
}

interface EscapeRoom {
  id: string;
  status: string;
  time_limit_seconds: number;
  max_participants: number;
  quiz_id: string;
  starts_at: string | null;
}

// ============================================================
// HELPERS
// ============================================================
function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function successResponse(data: Record<string, unknown>): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req: Request) => {

  // Only allow POST
  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  // Parse body
  let payload: StartRoomPayload;
  try {
    payload = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const { room_id, started_by } = payload;

  if (!room_id || !started_by) {
    return errorResponse("room_id and started_by are required");
  }

  // Use service role client — bypasses RLS for trusted server-side ops
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 1. Fetch the room ────────────────────────────────────
  const { data: room, error: roomError } = await supabase
    .from("escape_rooms")
    .select("id, status, time_limit_seconds, max_participants, quiz_id, starts_at, created_by")
    .eq("id", room_id)
    .single<EscapeRoom & { created_by: string }>();

  if (roomError || !room) {
    return errorResponse("Room not found", 404);
  }

  // ── 2. Validate room is in lobby state ───────────────────
  if (room.status !== "lobby") {
    return errorResponse(
      `Room cannot be started. Current status: ${room.status}`
    );
  }

  // ── 3. Validate caller is the room creator ───────────────
  //    Only the person who created the room can start it.
  //    Remove this check if admins/teachers should also be able to start rooms.
  if (room.created_by !== started_by) {
    return errorResponse("Only the room creator can start the room", 403);
  }

  // ── 4. Check participant count ───────────────────────────
  const { count: participantCount, error: countError } = await supabase
    .from("room_sessions")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room_id);

  if (countError) {
    return errorResponse("Failed to fetch participant count", 500);
  }

  if (!participantCount || participantCount < 1) {
    return errorResponse("Cannot start a room with no participants");
  }

  // ── 5. Validate the quiz has questions ───────────────────
  const { count: questionCount, error: questionError } = await supabase
    .from("room_puzzles")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room_id);

  if (questionError) {
    return errorResponse("Failed to validate room puzzles", 500);
  }

  if (!questionCount || questionCount < 1) {
    return errorResponse("Room has no puzzles. Add questions before starting.");
  }

  // ── 6. Calculate start and end times ─────────────────────
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + room.time_limit_seconds * 1000);

  // ── 7. Update the room to active ─────────────────────────
  const { error: updateError } = await supabase
    .from("escape_rooms")
    .update({
      status: "active",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", room_id)
    .eq("status", "lobby"); // extra guard: only update if still lobby (race condition protection)

  if (updateError) {
    return errorResponse("Failed to start room. It may have already been started.", 409);
  }

  // ── 8. Schedule auto-completion ──────────────────────────
  //    Kick off a background task to mark the room as completed
  //    when the timer runs out. Uses Deno's built-in setTimeout.
  //    For production, replace with a Supabase pg_cron job or
  //    a Postgres scheduled function for reliability.
  EdgeRuntime.waitUntil(
    (async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, room.time_limit_seconds * 1000)
      );

      // Only mark completed if still active (not manually cancelled)
      await supabase
        .from("escape_rooms")
        .update({ status: "completed" })
        .eq("id", room_id)
        .eq("status", "active");

      // Final leaderboard refresh
      await supabase.rpc("refresh_leaderboard", { p_room_id: room_id });

      console.log(`Room ${room_id} auto-completed after timer expired.`);
    })()
  );

  // ── 9. Return success payload ─────────────────────────────
  //    The frontend uses starts_at + time_limit_seconds to drive the timer.
  return successResponse({
    message: "Room started successfully",
    room_id,
    status: "active",
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    time_limit_seconds: room.time_limit_seconds,
    participant_count: participantCount,
    puzzle_count: questionCount,
  });
});