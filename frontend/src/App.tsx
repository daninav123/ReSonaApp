import { useState } from 'react'
import './App.css'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom' 
import DashboardPage from './pages/DashboardPage';
import Layout from './components/layout/Layout';

interface Client { _id: string; name: string }

function App() {
  const [token, setToken] = useState<string>('')
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 5

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [authError, setAuthError] = useState<string>('')
  const navigate = useNavigate()

  const startIndex = (currentPage - 1) * itemsPerPage
  const pagedClients = clients.slice(startIndex, startIndex + itemsPerPage)

  const loadClients = async () => {
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg)
      }
      const data = await res.json()
      setClients(data.data)
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      setError((err as Error).message || 'Error fetching clients')
    }
  }

  const login = async () => {
    setAuthError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const errRes = await res.json()
        throw new Error(errRes.message || 'Login failed')
      }
      const data = await res.json()
      setToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      setAuthError((err as Error).message)
    }
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? (
        <div className="login-container">
          <h1>Login</h1>
          <div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login}>Iniciar sesión</button>
          </div>
          {authError && <div className="error">{authError}</div>}
        </div>
      ) : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={token ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
      <Route path="/clients" element={token ? (
        <Layout>
        <div className="App">
          <h1>Clientes</h1>
          <div>
            <input
              type="text"
              placeholder="Token JWT"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button onClick={() => loadClients()}>Cargar clientes</button>
          </div>
          {error && <div className="error">{error}</div>}
          <ul>
            {pagedClients.map((c) => (
              <li key={c._id}>{c.name}</li>
            ))}
          </ul>
          <div className="pagination">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
            <span>Página {currentPage}</span>
            <button disabled={currentPage * itemsPerPage >= clients.length} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </Layout>
      ) : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
