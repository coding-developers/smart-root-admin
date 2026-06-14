import { useEffect, useState } from 'react'
import { api } from '../api.js'

const STATUS = {
  ativo: { rotulo: 'Ativo', classe: 'verde' },
  pendente: { rotulo: 'Pendente', classe: 'ambar' },
  inativo: { rotulo: 'Inativo', classe: 'cinza' },
}

export default function Clients() {
  const [clientes, setClientes] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [erro, setErro] = useState('')
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState(null)

  async function carregar() {
    setErro('')
    try {
      const q = filtro ? `?status_filtro=${filtro}` : ''
      setClientes(await api.get('/admin/clients' + q))
    } catch (e) { setErro(e.message) }
  }
  useEffect(() => { carregar() }, [filtro])

  async function mudarStatus(c, status) {
    try {
      await api.patch(`/admin/clients/${c.id}/status`, { status })
      carregar()
    } catch (e) { setErro(e.message) }
  }

  return (
    <div>
      <div className="cabecalho">
        <h1>Clientes</h1>
        <button className="botao primario" onClick={() => setCriando(true)}>+ Novo cliente</button>
      </div>

      <div className="filtros">
        {['', 'pendente', 'ativo', 'inativo'].map((f) => (
          <button key={f || 'todos'} className={`chip ${filtro === f ? 'ativo' : ''}`}
                  onClick={() => setFiltro(f)}>
            {f === '' ? 'Todos' : STATUS[f].rotulo}
          </button>
        ))}
      </div>

      {erro && <p className="erro">{erro}</p>}
      {clientes === null ? <p className="suave">Carregando…</p> : (
        <table className="tabela">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Status</th><th>Cadastro</th><th>Ações</th></tr></thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td className="suave">{c.email}</td>
                <td><span className={`tag ${STATUS[c.status].classe}`}>{STATUS[c.status].rotulo}</span></td>
                <td className="suave">{new Date(c.criado_em).toLocaleDateString('pt-BR')}</td>
                <td className="acoes">
                  {c.status === 'pendente' && (
                    <button className="botao primario pequeno" onClick={() => mudarStatus(c, 'ativo')}>Aprovar</button>
                  )}
                  {c.status === 'ativo' && (
                    <button className="botao secundario pequeno" onClick={() => mudarStatus(c, 'inativo')}>Inativar</button>
                  )}
                  {c.status === 'inativo' && (
                    <button className="botao secundario pequeno" onClick={() => mudarStatus(c, 'ativo')}>Reativar</button>
                  )}
                  <button className="link-btn" onClick={() => setEditando(c)}>Editar</button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && <tr><td colSpan={5} className="suave">Nenhum cliente.</td></tr>}
          </tbody>
        </table>
      )}

      {criando && <ModalCliente aoFechar={() => setCriando(false)} aoSalvar={() => { setCriando(false); carregar() }} />}
      {editando && <ModalCliente cliente={editando} aoFechar={() => setEditando(null)} aoSalvar={() => { setEditando(null); carregar() }} />}
    </div>
  )
}

function ModalCliente({ cliente, aoFechar, aoSalvar }) {
  const edicao = !!cliente
  const [form, setForm] = useState({
    nome: cliente?.nome || '', email: cliente?.email || '', senha: '',
    status: cliente?.status || 'ativo',
  })
  const [erro, setErro] = useState('')

  function set(campo) { return (e) => setForm({ ...form, [campo]: e.target.value }) }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    try {
      if (edicao) {
        const corpo = { nome: form.nome, email: form.email }
        if (form.senha) corpo.senha = form.senha
        await api.put(`/admin/clients/${cliente.id}`, corpo)
      } else {
        await api.post('/admin/clients', {
          nome: form.nome, email: form.email, senha: form.senha, status: form.status,
        })
      }
      aoSalvar()
    } catch (err) { setErro(err.message) }
  }

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <form className="cartao modal" onClick={(e) => e.stopPropagation()} onSubmit={salvar}>
        <h2>{edicao ? 'Editar cliente' : 'Novo cliente'}</h2>
        <label>Nome<input value={form.nome} onChange={set('nome')} required minLength={2} /></label>
        <label>E-mail<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>{edicao ? 'Nova senha (deixe em branco p/ manter)' : 'Senha'}
          <input type="password" value={form.senha} onChange={set('senha')}
                 required={!edicao} minLength={edicao ? 0 : 6} />
        </label>
        {!edicao && (
          <label>Status inicial
            <select value={form.status} onChange={set('status')}>
              <option value="ativo">Ativo (já liberado)</option>
              <option value="pendente">Pendente</option>
            </select>
          </label>
        )}
        {erro && <p className="erro">{erro}</p>}
        <div className="modal-botoes">
          <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario">Salvar</button>
        </div>
      </form>
    </div>
  )
}
