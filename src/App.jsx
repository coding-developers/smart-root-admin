import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import Devices from './pages/Devices.jsx'
import Tickets from './pages/Tickets.jsx'

function Protegida({ children }) {
  const { admin, carregando } = useAuth()
  if (carregando) return <div className="centro">Carregando…</div>
  if (!admin) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { admin } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Protegida><Layout /></Protegida>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/placas" element={<Devices />} />
        <Route path="/chamados" element={<Tickets />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
