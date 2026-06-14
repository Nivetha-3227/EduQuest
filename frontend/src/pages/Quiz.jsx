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
  const [started, setStarted] = useState(false)
  const [doorsUnlocked, setDoorsUnlocked] = useState(0)
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
    if (!started || loading) return
    if (timeLeft === 0) handleNext()
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, started, loading])

  const handleAnswer = (option) => {
    if (selected) return
    setSelected(option)
    const correct = questions[current].correct
    const speedBonus = Math.max(0, timeLeft)
    if (option === correct) {
      setScore(s => s + 10 + speedBonus)
      setDoorsUnlocked(d => d + 1)
    }
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      localStorage.setItem('finalScore', score)
      localStorage.setItem('totalQuestions', questions.length)
      localStorage.setItem('doorsUnlocked', doorsUnlocked)
      navigate('/results')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setTimeLeft(20)
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loadingBox}>
        <p style={styles.loadingIcon}>🔐</p>
        <p style={styles.loadingText}>Preparing your escape room...</p>
        <p style={styles.loadingSubtext}>AI is generating your challenges</p>
      </div>
    </div>
  )

  if (!started) return (
    <div style={styles.container}>
      <div style={styles.introCard}>
        <p style={styles.bigLock}>🔒</p>
        <h1 style={styles.introTitle}>YOU HAVE BEEN LOCKED!</h1>
        <p style={styles.introText}>
          To unlock the room, you must solve <strong style={{color:'#f7d060'}}>{questions.length} challenges</strong> related to your study topic.
        </p>
        <div style={styles.rulesBox}>
          <p style={styles.rule}>🗝️ Each correct answer unlocks a door</p>
          <p style={styles.rule}>⚡ Answer faster to earn bonus points</p>
          <p style={styles.rule}>🔑 Unlock all doors to escape the room!</p>
          <p style={styles.rule}>⏱️ You have 20 seconds per challenge</p>
        </div>
        <button style={styles.startBtn} onClick={() => setStarted(true)}>
          🚪 Begin Escape
        </button>
      </div>
    </div>
  )

  const q = questions[current]
  const progress = ((current) / questions.length) * 100
  const isLast = current + 1 === questions.length

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.roomText}>🏚️ ESCAPE ROOM</span>
            <span style={styles.challengeText}>Challenge {current + 1} of {questions.length}</span>
          </div>
          <div style={styles.headerRight}>
            <span style={timeLeft <= 5 ? styles.timerRed : styles.timer}>⏱️ {timeLeft}s</span>
            <span style={styles.score}>🗝️ {doorsUnlocked} unlocked</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={styles.progressBg}>
          <div style={{...styles.progressFill, width: `${progress}%`}} />
        </div>
        <p style={styles.progressLabel}>
          {Array.from({length: questions.length}, (_, i) => 
            i < doorsUnlocked ? '🔓' : i === current ? '🔒' : '🚪'
          ).join(' ')}
        </p>

        {/* Question */}
        <div style={styles.questionBox}>
          <p style={styles.questionLabel}>🔍 CRACK THE CODE</p>
          <p style={styles.question}>{q.question}</p>
        </div>

        {/* Options */}
        <div style={styles.options}>
          {q.options.map((opt, i) => {
            let bg = '#1a1a2e'
            let border = '1px solid #333'
            let icon = '🚪'
            if (selected) {
              if (opt === q.correct) { bg = '#1a472a'; border = '2px solid #4ecca3'; icon = '🔓' }
              else if (opt === selected) { bg = '#4a1a1a'; border = '2px solid #e94560'; icon = '❌' }
            }
            return (
              <button key={i} style={{...styles.option, background: bg, border}}
                onClick={() => handleAnswer(opt)}>
                <span style={styles.optionIcon}>{icon}</span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {selected && (
          <div style={styles.explanationBox}>
            <p style={styles.explanationText}>
              {selected === q.correct ? '🎉 Door unlocked! ' : '💀 Wrong key! '}
              {q.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {selected && (
          <button style={styles.nextBtn} onClick={handleNext}>
            {isLast ? '🔑 Use Final Key to Escape!' : '➡️ Next Challenge'}
          </button>
        )}

      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a', backgroundImage: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0a 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Courier New', monospace" },
  loadingBox: { textAlign: 'center' },
  loadingIcon: { fontSize: '64px', marginBottom: '16px' },
  loadingText: { color: '#4ecca3', fontSize: '20px', marginBottom: '8px' },
  loadingSubtext: { color: '#666', fontSize: '14px' },
  introCard: { background: '#0f0f1a', border: '2px solid #e94560', borderRadius: '16px', padding: '48px', maxWidth: '560px', width: '100%', textAlign: 'center', boxShadow: '0 0 40px rgba(233,69,96,0.3)' },
  bigLock: { fontSize: '80px', marginBottom: '16px' },
  introTitle: { color: '#e94560', fontSize: '28px', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '16px' },
  introText: { color: '#ccc', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' },
  rulesBox: { background: '#0a0a1a', borderRadius: '12px', padding: '20px', marginBottom: '32px', textAlign: 'left' },
  rule: { color: '#aaa', fontSize: '14px', marginBottom: '10px', lineHeight: '1.5' },
  startBtn: { background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 48px', fontSize: '18px', cursor: 'pointer', letterSpacing: '2px', boxShadow: '0 0 20px rgba(233,69,96,0.5)' },
  card: { background: '#0f0f1a', border: '1px solid #333', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '640px', boxShadow: '0 0 40px rgba(0,0,0,0.8)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  roomText: { color: '#e94560', fontSize: '12px', letterSpacing: '2px', fontWeight: 'bold' },
  challengeText: { color: '#666', fontSize: '12px' },
  timer: { color: '#4ecca3', fontSize: '18px', fontWeight: 'bold' },
  timerRed: { color: '#e94560', fontSize: '18px', fontWeight: 'bold', animation: 'pulse 0.5s infinite' },
  score: { color: '#f7d060', fontSize: '13px' },
  progressBg: { background: '#1a1a2e', borderRadius: '8px', height: '6px', marginBottom: '8px' },
  progressFill: { background: 'linear-gradient(90deg, #e94560, #f7d060)', height: '6px', borderRadius: '8px', transition: 'width 0.3s' },
  progressLabel: { fontSize: '16px', marginBottom: '24px', letterSpacing: '4px' },
  questionBox: { background: '#0a0a1a', border: '1px solid #333', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  questionLabel: { color: '#e94560', fontSize: '11px', letterSpacing: '3px', marginBottom: '12px' },
  question: { color: '#fff', fontSize: '17px', lineHeight: '1.6' },
  options: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  option: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: 'all 0.2s' },
  optionIcon: { fontSize: '18px', minWidth: '24px' },
  explanationBox: { background: '#0a1a0a', border: '1px solid #4ecca3', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  explanationText: { color: '#4ecca3', fontSize: '13px', lineHeight: '1.6' },
  nextBtn: { width: '100%', padding: '14px', background: 'linear-gradient(90deg, #e94560, #f7d060)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' },
}

export default Quiz