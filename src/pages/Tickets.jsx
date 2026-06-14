import { useEffect, useState } from 'react'
import { api } from '../api.js'

const STATUS = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  fechado: 'Fechado',
}
const PROXIMOS = {
  aberto: ['em_andamento', 'fechado'],
  em_andamento: ['fechado', 'aberto'],
  fechado: ['aberto'],
}

export default function Tickets() {
  const [tickets, setTickets] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    setErro('')
    try {
      const q = filtro ? `?status_filtro=${filtro}` : ''
      setTickets(await api.get('/admin/tickets' + q))
    } catch (e) { setErro(e.message) }
  }
  useEffect(() => { carregar() }, [filtro])

  async function mudar(t, status) {
    try {
      await api.patch(`/admin/tickets/${t.id}`, { status })
      carregar()
    } catch (e) { setErro(e.message) }
  }

  return (
    <div>
      <h1>Chamados</h1>
      <div className="filtros">
        {['', 'aberto', 'em_andamento', 'fechado'].map((f) => (
          <button key={f || 'todos'} className={`chip ${filtro === f ? 'ativo' : ''}`}
                  onClick={() => setFiltro(f)}>
            {f === '' ? 'Todos' : STATUS[f]}
          </button>
        ))}
      </div>

      {erro && <p className="erro">{erro}</p>}
      {tickets === null ? <p className="suave">Carregando…</p> : (
        <table className="tabela">
          <thead><tr><th>Cliente</th><th>Assunto</th><th>Descrição</th><th>Status</th><th>Aberto em</th><th>Mudar para</th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <div>{t.cliente_nome}</div>
                  <span className="suave mono">{t.cliente_email}</span>
                </td>
                <td>{t.assunto}</td>
                <td className="suave">{t.descricao}</td>
                <td><span className={`tag status-${t.status}`}>{STATUS[t.status]}</span></td>
                <td className="suave">{new Date(t.criado_em).toLocaleString('pt-BR')}</td>
                <td className="acoes">
                  {PROXIMOS[t.status].map((s) => (
                    <button key={s} className="botao secundario pequeno" onClick={() => mudar(t, s)}>
                      {STATUS[s]}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && <tr><td colSpan={6} className="suave">Nenhum chamado.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
