// supabase/functions/report-tab-switch/index.ts
Deno.serve(async (req) => {
  const { session_id, event_type } = await req.json();

  // Log the violation
  await supabase.from("integrity_events").insert({ session_id, event_type });

  // Increment counter
  const { data: session } = await supabase
    .from("room_sessions")
    .select("tab_switch_count")
    .eq("id", session_id)
    .single();

  const new_count = (session.tab_switch_count || 0) + 1;
  const updates: any = { tab_switch_count: new_count };

  // Disqualify after 3 violations
  if (new_count >= 3) {
    updates.is_disqualified = true;
  }

  await supabase
    .from("room_sessions")
    .update(updates)
    .eq("id", session_id);

  return new Response(
    JSON.stringify({ warning_count: new_count, disqualified: new_count >= 3 }),
    { headers: { "Content-Type": "application/json" } }
  );
});