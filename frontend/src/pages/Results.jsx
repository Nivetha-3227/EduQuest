import React from 'react'
import { useNavigate } from 'react-router-dom'

function Results() {
  const navigate = useNavigate()
  const score = localStorage.getItem('finalScore') || 0
  const total = localStorage.getItem('totalQuestions') || 0

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎉 Quiz Complete!</h2>
        <div style={styles.scoreBox}>
          <p style={styles.scoreLabel}>Your Score</p>
          <p style={styles.scoreValue}>{score}</p>
          <p style={styles.totalLabel}>from {total} questions</p>
        </div>
        <div style={styles.buttonRow}>
          <button style={styles.btnSecondary} onClick={() => navigate('/upload')}>📄 New Quiz</button>
          <button style={styles.btnPrimary} onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '16px', width: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', textAlign: 'center' },
  title: { color: '#e94560', marginBottom: '32px' },
  scoreBox: { background: '#16213e', borderRadius: '12px', padding: '32px', marginBottom: '32px' },
  scoreLabel: { color: '#aaa', fontSize: '14px', marginBottom: '8px' },
  scoreValue: { color: '#f7d060', fontSize: '64px', fontWeight: 'bold', margin: '0' },
  totalLabel: { color: '#aaa', fontSize: '13px', marginTop: '8px' },
  buttonRow: { display: 'flex', gap: '12px' },
  btnPrimary: { flex: 1, padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  btnSecondary: { flex: 1, padding: '12px', background: '#16213e', color: '#fff', border: '1px solid #e94560', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }
}

export default Results