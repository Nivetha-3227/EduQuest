import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpload = async (mode) => {
    if (!file) return alert('Please select a PDF first!')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      const res = await axios.post('http://127.0.0.1:5000/api/upload-pdf', formData)
      localStorage.setItem('pdfText', res.data.text)
      localStorage.setItem('pdfName', file.name)
      setLoading(false)
      if (mode === 'summary') navigate('/summary')
      else navigate('/quiz-config')
    } catch (err) {
      setLoading(false)
      alert('Error uploading PDF: ' + err.message)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📚 EduQuest</h1>
        <p style={styles.subtitle}>Upload your study material</p>
        <div style={styles.uploadBox}>
          <p style={styles.uploadText}>📄 Drop your PDF here</p>
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={styles.fileInput} />
          {file && <p style={styles.fileName}>✅ {file.name}</p>}
        </div>
        {loading ? <p style={styles.loading}>Processing PDF...</p> : (
          <div style={styles.buttonRow}>
            <button style={styles.btnSecondary} onClick={() => handleUpload('summary')}>📝 Summarize</button>
            <button style={styles.btnPrimary} onClick={() => handleUpload('quiz')}>🎯 Take Quiz</button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1a1a2e', padding: '40px', borderRadius: '16px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  title: { color: '#e94560', textAlign: 'center', marginBottom: '8px' },
  subtitle: { color: '#aaa', textAlign: 'center', marginBottom: '24px' },
  uploadBox: { border: '2px dashed #e94560', borderRadius: '12px', padding: '30px', textAlign: 'center', marginBottom: '24px' },
  uploadText: { color: '#aaa', marginBottom: '12px' },
  fileInput: { color: '#fff' },
  fileName: { color: '#4ecca3', marginTop: '12px', fontSize: '13px' },
  loading: { color: '#4ecca3', textAlign: 'center' },
  buttonRow: { display: 'flex', gap: '12px' },
  btnPrimary: { flex: 1, padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  btnSecondary: { flex: 1, padding: '12px', background: '#16213e', color: '#fff', border: '1px solid #e94560', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }
}

export default Upload