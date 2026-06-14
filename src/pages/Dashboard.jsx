import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import Donut from '../components/Donut.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [tickets, setTickets] = useState([])
  const [pendentes, setPendentes] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/tickets?status_filtro=aberto'),
      api.get('/admin/clients?status_filtro=pendente'),
    ])
      .then(([s, t, p]) => { setStats(s); setTickets(t); setPendentes(p) })
      .catch((e) => setErro(e.message))
  }, [])

  if (erro) return <p className="erro">{erro}</p>
  if (!stats) return <p className="suave">Carregando…</p>

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="grid-cards">
        <Card titulo="Clientes ativos" valor={stats.clientes_ativos} cor="#16a34a" />
        <Card titulo="Pendentes" valor={stats.clientes_pendentes} cor="#d97706" />
        <Card titulo="Inativos" valor={stats.clientes_inativos} cor="#6b7280" />
        <Card titulo="Chamados abertos" valor={stats.tickets_abertos} cor="#2563eb" />
        <Card titulo="Placas online" valor={stats.devices_online} cor="#16a34a" />
        <Card titulo="Placas offline" valor={stats.devices_offline} cor="#dc2626" />
      </div>

      <div className="duas-colunas">
        <section className="cartao">
          <h2>Clientes por status</h2>
          <Donut fatias={[
            { label: 'Ativos', valor: stats.clientes_ativos, cor: '#16a34a' },
            { label: 'Pendentes', valor: stats.clientes_pendentes, cor: '#d97706' },
            { label: 'Inativos', valor: stats.clientes_inativos, cor: '#9ca3af' },
          ]} />
        </section>

        <section className="cartao">
          <h2>Cadastros aguardando aprovação</h2>
          {pendentes.length === 0 ? (
            <p className="suave">Nenhum cadastro pendente. 👍</p>
          ) : (
            <ul className="lista-simples">
              {pendentes.map((c) => (
                <li key={c.id}>
                  <span>{c.nome} <span className="suave">— {c.email}</span></span>
                  <Link className="botao primario pequeno" to="/clientes">Revisar</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="cartao">
        <h2>Chamados abertos</h2>
        {tickets.length === 0 ? (
          <p className="suave">Nenhum chamado aberto no momento.</p>
        ) : (
          <table className="tabela">
            <thead><tr><th>Cliente</th><th>Assunto</th><th>Descrição</th><th>Aberto em</th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.cliente_nome}</td>
                  <td>{t.assunto}</td>
                  <td className="suave">{t.descricao}</td>
                  <td>{new Date(t.criado_em).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Card({ titulo, valor, cor }) {
  return (
    <div className="cartao stat-card">
      <span className="stat-num" style={{ color: cor }}>{valor}</span>
      <span className="stat-titulo">{titulo}</span>
    </div>
  )
}
