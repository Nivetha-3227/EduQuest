
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenAI } from "https://esm.sh/@google/genai";

Deno.serve(async (req) => {
  const { note_id } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const ai = new GoogleGenAI({
  apiKey: Deno.env.get("GEMINI_API_KEY"),
});


  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", note_id)
    .single();

  
  await supabase
    .from("notes")
    .update({ status: "processing" })
    .eq("id", note_id);

  
  const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: `
You are a study assistant. Given the notes below:

1. Write a concise summary (3-5 sentences).
2. Generate 10 multiple-choice questions as JSON.

Return ONLY valid JSON in this format:

{
  "summary": "...",
  "questions": [
    {
      "question_text": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_option": 0,
      "explanation": "...",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Notes:
${note.raw_content}
`,
  config: {
    responseMimeType: "application/json"
  }
});

const parsed = JSON.parse(response.text);


  await supabase
    .from("notes")
    .update({ summary: parsed.summary, status: "done" })
    .eq("id", note_id);

  
  const { data: quiz } = await supabase
    .from("quizzes")
    .insert({ note_id, user_id: note.user_id })
    .select()
    .single();

  const questions = parsed.questions.map((q: any) => ({
    ...q,
    quiz_id: quiz.id,
  }));

  await supabase.from("questions").insert(questions);

  return new Response(JSON.stringify({ quiz_id: quiz.id }), {
    headers: { "Content-Type": "application/json" },
  });
});