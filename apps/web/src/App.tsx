import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface ApiResponse {
  status: string
}

function App() {
  const [count, setCount] = useState(0)
  const [apiStatus, setApiStatus] = useState<string>('Loading...')
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    // Test API connection via Vite proxy
    fetch('/api/test')
      .then(res => res.json())
      .then((data: ApiResponse) => {
        setApiStatus(`✅ API Connected! Status: ${data.status}`)
        setApiError(null)
      })
      .catch(err => {
        setApiStatus('❌ API Connection Failed')
        setApiError(err.message)
      })
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>FashionApp</h1>
      
      <div className="card" style={{ 
        padding: '20px', 
        backgroundColor: apiError ? '#fee' : '#efe',
        marginBottom: '20px'
      }}>
        <h2>API Status</h2>
        <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{apiStatus}</p>
        {apiError && <p style={{ color: 'red', fontSize: '0.9em' }}>Error: {apiError}</p>}
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Proxy: /api/test → http://localhost:3000/api/test
        </p>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
