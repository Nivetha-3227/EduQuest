import React from 'react'
import { useNavigate } from 'react-router-dom'

function Results() {
  const navigate = useNavigate()
  const score = localStorage.getItem('finalScore') || 0
  const total = localStorage.getItem('totalQuestions') || 0
  const unlocked = localStorage.getItem('doorsUnlocked') || 0
  const escaped = parseInt(unlocked) === parseInt(total)

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.bigIcon}>{escaped ? '🎉' : '💀'}</p>
        <h2 style={escaped ? styles.titleWin : styles.titleLose}>
          {escaped ? 'YOU ESCAPED!' : 'STILL LOCKED...'}
        </h2>
        <p style={styles.subtitle}>
          {escaped ? 'Congratulations! You cracked all the codes!' : `You unlocked ${unlocked} out of ${total} doors`}
        </p>
        <div style={styles.scoreBox}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>🗝️ Doors Unlocked</span>
            <span style={styles.statValue}>{unlocked}/{total}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>⭐ Total Score</span>
            <span style={styles.statValue}>{score} pts</span>
          </div>
        </div>
        <div style={styles.buttonRow}>
          <button style={styles.btnSecondary} onClick={() => navigate('/upload')}>🔄 Try Again</button>
          <button style={styles.btnPrimary} onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a', backgroundImage: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0a 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace" },
  card: { background: '#0f0f1a', border: '2px solid #333', borderRadius: '16px', padding: '48px', width: '380px', textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.8)' },
  bigIcon: { fontSize: '80px', marginBottom: '16px' },
  titleWin: { color: '#4ecca3', fontSize: '28px', letterSpacing: '4px', marginBottom: '8px' },
  titleLose: { color: '#e94560', fontSize: '28px', letterSpacing: '4px', marginBottom: '8px' },
  subtitle: { color: '#aaa', fontSize: '14px', marginBottom: '32px' },
  scoreBox: { background: '#0a0a1a', borderRadius: '12px', padding: '24px', marginBottom: '32px' },
  statRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  statLabel: { color: '#aaa', fontSize: '14px' },
  statValue: { color: '#f7d060', fontSize: '18px', fontWeight: 'bold' },
  buttonRow: { display: 'flex', gap: '12px' },
  btnPrimary: { flex: 1, padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  btnSecondary: { flex: 1, padding: '12px', background: '#0a0a1a', color: '#fff', border: '1px solid #e94560', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }
}

export default Results