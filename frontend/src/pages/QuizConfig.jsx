import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function QuizConfig() {
  const [questions, setQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const navigate = useNavigate()

  const handleStart = () => {
    localStorage.setItem('quizConfig', JSON.stringify({ questions, difficulty }))
    navigate('/quiz')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>⚙️ Quiz Settings</h2>
        <p style={styles.label}>Number of Questions</p>
        <div style={styles.optionRow}>
          {[5, 10, 15, 20].map(n => (
            <button key={n} style={questions === n ? styles.optionActive : styles.option}
              onClick={() => setQuestions(n)}>{n}</button>
          ))}
        </div>
        <p style={styles.label}>Difficulty Level</p>
        <div style={styles.optionRow}>
          {['easy', 'medium', 'hard'].map(d => (
            <button key={d} style={difficulty === d ? styles.optionActive : styles.option}
              onClick={() => setDifficulty(d)}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
          ))}
        </div>
        <button style={styles.button} onClick={handleStart}>🚀 Start Quiz</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '16px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  title: { color: '#e94560', marginBottom: '24px', textAlign: 'center' },
  label: { color: '#aaa', marginBottom: '12px', fontSize: '14px' },
  optionRow: { display: 'flex', gap: '10px', marginBottom: '24px' },
  option: { flex: 1, padding: '10px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  optionActive: { flex: 1, padding: '10px', background: '#e94560', color: '#fff', border: '1px solid #e94560', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  button: { width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }
}

export default QuizConfig