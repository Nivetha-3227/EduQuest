import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Initialize Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
);

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function generateEscapeRoomData(materialText: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are an expert educational game designer. Take this study material and turn it into a 3-stage escape room puzzle game. Create a creative theme based on the topic. Create 3 progressive stages. For each stage, write a clever riddle or question whose answer is a specific, core concept or definition found in the text. Keep answers to 1-2 words.\n\nStudy Material:\n${materialText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          room_theme: { type: "STRING" },
          total_stages: { type: "INTEGER" },
          stages: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                stage_id: { type: "INTEGER" },
                stage_name: { type: "STRING" },
                riddle: { type: "STRING" },
                puzzle_type: { type: "STRING" },
                correct_answer: { type: "STRING" },
                hint: { type: "STRING" },
              },
              required: ["stage_id", "stage_name", "riddle", "puzzle_type", "correct_answer", "hint"],
            },
          },
        },
        required: ["room_theme", "total_stages", "stages"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response text returned from Gemini");
  }

  return JSON.parse(response.text);
}