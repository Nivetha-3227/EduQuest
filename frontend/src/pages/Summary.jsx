import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Summary() {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSummary = async () => {
      const text = localStorage.getItem('pdfText')
      const res = await axios.post('http://127.0.0.1:5000/api/summarize', { text })
      setSummary(res.data.summary)
      setLoading(false)
    }
    fetchSummary()
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Summary</h2>
        {loading ? <p style={styles.loading}>Generating summary...</p> : (
          <>
            <div style={styles.summaryBox}><p style={styles.summaryText}>{summary}</p></div>
            <button style={styles.button} onClick={() => navigate('/quiz-config')}>🎯 Take Quiz Now</button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '700px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  title: { color: '#e94560', marginBottom: '24px' },
  loading: { color: '#4ecca3', textAlign: 'center' },
  summaryBox: { background: '#16213e', borderRadius: '12px', padding: '24px', marginBottom: '24px', maxHeight: '400px', overflowY: 'auto' },
  summaryText: { color: '#ddd', lineHeight: '1.8', fontSize: '15px' },
  button: { width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }
}

export default Summary