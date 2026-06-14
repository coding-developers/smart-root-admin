import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Layout() {
  const { admin, logout } = useAuth()
  return (
    <div className="shell">
      <aside className="barra-lateral">
        <div className="marca">🌱 Irrigação<span>Admin</span></div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/placas">Placas</NavLink>
          <NavLink to="/chamados">Chamados</NavLink>
        </nav>
        <div className="rodape-lateral">
          <span className="suave">{admin?.email}</span>
          <button className="botao secundario bloco" onClick={logout}>Sair</button>
        </div>
      </aside>
      <main className="area">
        <Outlet />
      </main>
    </div>
  )
}
