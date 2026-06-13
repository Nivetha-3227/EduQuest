import { useState } from 'react';
import { generateEscapeRoomData, supabase } from './utils/services';
import mockGameData from './data/mockGame.json';

export default function App() {
  const [gameState, setGameState] = useState<'login' | 'upload' | 'lobby' | 'victory'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<any>(mockGameData);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // FIXED: State added to store multiple uploaded file objects cleanly
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const currentStage = game?.stages?.[currentStageIndex];

  // FIXED: Integrated the upgraded multi-format extraction logic directly into the form lifecycle
  const handleGenerateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback block: If no documents are uploaded, seamlessly jump to demo mode
    if (uploadedFiles.length === 0) {
      alert("No files chosen! Loading sample simulation mode instead.");
      setGame(mockGameData);
      setCurrentStageIndex(0);
      setGameState('lobby');
      return;
    }
    
    setLoading(true);

    try {
      // Loop through all queue files asynchronously and transform them to clean plain text
      const fileProcessingPromises = uploadedFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const reader = new FileReader();

          // Image Parsing
          if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
            resolve(`[IMAGE ATTACHMENT CONTEXT: Name: ${file.name}, Size: ${(file.size / 1024).toFixed(1)} KB]`);
          } 
          // Complex Document Strip-Down (PDF, DOCX)
          else if (['pdf', 'docx'].includes(fileExtension || '')) {
            reader.onload = (event) => {
              const rawContent = event.target?.result as string || "";
              // Scrub binary machine junk so it doesn't break JSON formatting bounds
              const cleanText = rawContent.replace(/[^\x20-\x7E\t\r\n]/g, "");
              resolve(`[DOCUMENT ATTACHMENT: ${file.name}]\n${cleanText.substring(0, 4000)}`);
            };
            reader.readAsText(file);
          } 
          // Structural Data & Plain Text Documents (.txt, .json, .md, .csv)
          else {
            reader.onload = (event) => {
              resolve(`[TEXT DOCUMENT: ${file.name}]\n${event.target?.result as string || ""}`);
            };
            reader.readAsText(file);
          }
        });
      });

      const processedContents = await Promise.all(fileProcessingPromises);
      const combinedTextData = processedContents.join("\n\n====================\n\n");

      // Pass aggregated study material down to the AI Service Broker
      const generatedJSON = await generateEscapeRoomData(combinedTextData);
      
      // Mirror and back up generation data payloads to remote database storage instance
      if (supabase) {
        await supabase
          .from('rooms')
          .insert([{ game_data: generatedJSON }]);
      }

      setGame(generatedJSON);
      setCurrentStageIndex(0);
      setGameState('lobby');
    } catch (err) {
      console.error("Pipeline Exception Captured:", err);
      alert("API endpoints unreachable or keys broken. Defaulting to local sandbox mode!");
      setGame(mockGameData);
      setCurrentStageIndex(0);
      setGameState('lobby');
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!currentStage) return;
    if (userAnswer.trim().toLowerCase() === currentStage.correct_answer.toLowerCase()) {
      setFeedback('🎉 Correct! Door Unlocked.');
      setTimeout(() => {
        if (currentStageIndex + 1 < game?.stages?.length) {
          setCurrentStageIndex(currentStageIndex + 1);
          setUserAnswer('');
          setFeedback('');
          setShowHint(false);
          setShowModal(false);
        } else {
          setGameState('victory');
        }
      }, 1500);
    } else {
      setFeedback('❌ Incorrect. Try again!');
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* 1. SIGN IN SCREEN */}
      {gameState === 'login' && (
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-indigo-400 tracking-wide">EDUQUEST AI</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to start creating educational escape rooms</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setGameState('upload'); }} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@eduquest.com" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold tracking-wide transition shadow-lg shadow-indigo-600/20 mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      )}

      {/* 2. UPLOAD/DASHBOARD MODULE */}
      {gameState === 'upload' && (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 text-center">
          <h1 className="text-3xl font-black mb-2 text-indigo-400 tracking-wide">EDUQUEST AI</h1>
          <p className="text-slate-400 text-sm mb-6">Convert study guides into an escape room lobby.</p>
          
          <form onSubmit={handleGenerateLobby} className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 hover:border-indigo-500 cursor-pointer relative bg-slate-900 transition">
              <input 
                type="file" 
                multiple 
                accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.csv,.json,.md" 
                onChange={(e) => {
                  if (e.target.files) {
                    setUploadedFiles(Array.from(e.target.files));
                  }
                }} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
              
              <div className="space-y-1 pointer-events-none">
                <span className="text-3xl block mb-1">📥</span>
                <p className="text-sm text-slate-300 font-medium">
                  {uploadedFiles.length > 0 ? "🎉 Files loaded & ready!" : "Upload study notes or drop them here"}
                </p>
                <p className="text-[11px] text-slate-500">Supports PDFs, Images, Word Docs, & Text</p>
              </div>
            </div>

            {/* Visualizing dynamic uploads map */}
            {uploadedFiles.length > 0 && (
              <div className="text-left p-3 bg-slate-950 rounded-xl border border-slate-700/60 max-h-36 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Queue Data Loaded:</p>
                <ul className="space-y-1">
                  {uploadedFiles.map((file, idx) => {
                    const ext = file.name.split('.').pop()?.toLowerCase();
                    let icon = "📄"; 
                    if (['jpg', 'jpeg', 'png'].includes(ext || '')) icon = "🖼️";
                    if (ext === 'pdf') icon = "📕";
                    if (ext === 'json' || ext === 'csv') icon = "📊";

                    return (
                      <li key={idx} className="text-xs text-indigo-300 flex items-center gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-700/30">
                        <span>{icon}</span>
                        <span className="truncate max-w-[200px] font-mono">{file.name}</span>
                        <span className="text-[9px] text-slate-500 ml-auto">({(file.size / 1024).toFixed(1)} KB)</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold tracking-wide transition shadow-lg disabled:opacity-50">
              {loading ? "⚡ Gemini Flash 2.5 is thinking..." : "Generate Escape Lobby"}
            </button>
          </form>
        </div>
      )}

      {/* 3. ESCAPE ROOM LOBBY */}
      {gameState === 'lobby' && (
        <div className="w-full max-w-4xl text-center">
          <header className="mb-6">
            <h2 className="text-4xl font-black text-amber-400 tracking-wide mb-1 uppercase">{game?.room_theme || "Escape Room"}</h2>
            <p className="text-slate-400 font-medium">Room Challenge {currentStageIndex + 1} of {game?.stages?.length || game?.total_stages || 3}</p>
          </header>
          <div className="bg-slate-950 aspect-video rounded-3xl border-4 border-slate-700 relative flex items-center justify-center p-8 shadow-2xl">
            <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:scale-105 transition-all text-white font-black px-8 py-5 rounded-2xl border-b-4 border-amber-800 flex flex-col items-center gap-2 animate-bounce shadow-xl">
              🔒 STAGE LINK: {currentStage?.stage_name}
            </button>
          </div>
        </div>
      )}

      {/* PUZZLE DETAILS INTERACTION INTERFACE */}
      {showModal && gameState === 'lobby' && currentStage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-lg w-full relative">
            <button onClick={() => { setShowModal(false); setFeedback(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h3 className="text-xl font-black text-indigo-400 mb-3">{currentStage.stage_name}</h3>
            <p className="text-md text-slate-100 mb-5 bg-slate-950 p-4 rounded-xl">{currentStage.riddle}</p>
            <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Your answer..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 mb-4 focus:outline-none focus:border-indigo-500 text-white" onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} />
            {showHint && <p className="text-sm text-amber-400 italic mb-4">💡 Hint: {currentStage.hint}</p>}
            <div className="flex gap-2">
              <button onClick={checkAnswer} className="flex-1 bg-emerald-600 py-3 rounded-xl font-bold transition hover:bg-emerald-500">Unlock</button>
              <button onClick={() => setShowHint(true)} className="bg-slate-700 px-5 py-3 rounded-xl font-semibold text-sm transition hover:bg-slate-600">Hint</button>
            </div>
            {feedback && <p className="mt-4 text-center font-bold text-lg">{feedback}</p>}
          </div>
        </div>
      )}

      {/* 4. VICTORY SCREEN */}
      {gameState === 'victory' && (
        <div className="text-center bg-slate-800 p-10 rounded-3xl border-2 border-emerald-500 max-w-md">
          <h1 className="text-6xl mb-4">🏆</h1>
          <h2 className="text-3xl font-black text-emerald-400 uppercase">Escaped Successfully!</h2>
          <button onClick={() => { setUploadedFiles([]); setGameState('upload'); setCurrentStageIndex(0); setUserAnswer(''); setFeedback(''); }} className="mt-6 bg-indigo-600 px-8 py-3 rounded-xl font-bold transition hover:bg-indigo-500">
            Load Next Room
          </button>
        </div>
      )}
    </main>
  );
}