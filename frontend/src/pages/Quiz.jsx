import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Quiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchQuiz = async () => {
      const text = localStorage.getItem('pdfText')
      const config = JSON.parse(localStorage.getItem('quizConfig'))
      const res = await axios.post('http://127.0.0.1:5000/api/generate-quiz', {
        text, difficulty: config.difficulty, num_questions: config.questions
      })
      setQuestions(res.data)
      setLoading(false)
    }
    fetchQuiz()
  }, [])

  useEffect(() => {
    if (loading) return
    if (timeLeft === 0) handleNext(null)
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, loading])

  const handleAnswer = (option) => {
    if (selected) return
    setSelected(option)
    const correct = questions[current].correct
    const speedBonus = Math.max(0, timeLeft)
    if (option === correct) setScore(s => s + 10 + speedBonus)
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      localStorage.setItem('finalScore', score)
      localStorage.setItem('totalQuestions', questions.length)
      navigate('/results')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setTimeLeft(20)
    }
  }

  if (loading) return <div style={styles.container}><p style={styles.loading}>🧠 Generating quiz with AI...</p></div>

  const q = questions[current]

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <span style={styles.counter}>Q {current + 1}/{questions.length}</span>
          <span style={timeLeft <= 5 ? styles.timerRed : styles.timer}>⏱ {timeLeft}s</span>
          <span style={styles.score}>⭐ {score}</span>
        </div>
        <div style={styles.progress}><div style={{ ...styles.progressBar, width: `${((current) / questions.length) * 100}%` }} /></div>
        <p style={styles.question}>{q.question}</p>
        <div style={styles.options}>
          {q.options.map((opt, i) => {
            let bg = '#16213e'
            if (selected) {
              if (opt === q.correct) bg = '#4ecca3'
              else if (opt === selected) bg = '#e94560'
            }
            return (
              <button key={i} style={{ ...styles.option, background: bg }}
                onClick={() => handleAnswer(opt)}>{opt}</button>
            )
          })}
        </div>
        {selected && <button style={styles.next} onClick={handleNext}>Next →</button>}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  topRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  counter: { color: '#aaa', fontSize: '14px' },
  timer: { color: '#4ecca3', fontSize: '16px', fontWeight: 'bold' },
  timerRed: { color: '#e94560', fontSize: '16px', fontWeight: 'bold' },
  score: { color: '#f7d060', fontSize: '14px' },
  progress: { background: '#16213e', borderRadius: '8px', height: '6px', marginBottom: '24px' },
  progressBar: { background: '#e94560', height: '6px', borderRadius: '8px', transition: 'width 0.3s' },
  question: { color: '#fff', fontSize: '18px', marginBottom: '24px', lineHeight: '1.6' },
  options: { display: 'flex', flexDirection: 'column', gap: '12px' },
  option: { padding: '14px', border: '1px solid #333', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '14px' },
  next: { marginTop: '24px', width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  loading: { color: '#4ecca3', fontSize: '18px' }
}

export default Quiz