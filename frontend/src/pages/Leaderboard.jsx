import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Leaderboard() {
  const [scores, setScores] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/leaderboard').then(res => setScores(res.data))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏆 Leaderboard</h2>
        {scores.length === 0 ? <p style={styles.empty}>No scores yet!</p> : (
          scores.map((s, i) => (
            <div key={i} style={styles.row}>
              <span style={styles.rank}>{medals[i] || `#${i + 1}`}</span>
              <span style={styles.name}>{s.email}</span>
              <span style={styles.diff}>{s.difficulty}</span>
              <span style={styles.scoreVal}>{s.score} pts</span>
            </div>
          ))
        )}
        <button style={styles.button} onClick={() => navigate('/upload')}>📄 New Quiz</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  title: { color: '#e94560', marginBottom: '24px', textAlign: 'center' },
  empty: { color: '#aaa', textAlign: 'center' },
  row: { display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#16213e', borderRadius: '8px', marginBottom: '10px', gap: '12px' },
  rank: { fontSize: '20px', width: '32px' },
  name: { flex: 1, color: '#fff', fontSize: '14px' },
  diff: { color: '#aaa', fontSize: '12px', textTransform: 'capitalize' },
  scoreVal: { color: '#f7d060', fontWeight: 'bold', fontSize: '16px' },
  button: { width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '24px' }
}

export default Leaderboard