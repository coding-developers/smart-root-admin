import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Devices() {
  const [devices, setDevices] = useState(null)
  const [clientes, setClientes] = useState([])
  const [erro, setErro] = useState('')
  const [cadastrando, setCadastrando] = useState(false)
  const [associando, setAssociando] = useState(null)

  async function carregar() {
    setErro('')
    try {
      const [d, c] = await Promise.all([
        api.get('/admin/devices'),
        api.get('/admin/clients?status_filtro=ativo'),
      ])
      setDevices(d)
      setClientes(c)
    } catch (e) { setErro(e.message) }
  }
  useEffect(() => { carregar() }, [])

  const nomeCliente = (id) => clientes.find((c) => c.id === id)?.nome || '—'

  return (
    <div>
      <div className="cabecalho">
        <h1>Placas (dispositivos)</h1>
        <button className="botao primario" onClick={() => setCadastrando(true)}>+ Cadastrar placa</button>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {devices === null ? <p className="suave">Carregando…</p> : (
        <table className="tabela">
          <thead><tr><th>Hardware ID</th><th>Apelido</th><th>Status</th><th>Cliente</th><th>Firmware</th><th>Última vez</th><th>Ações</th></tr></thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>
                <td className="mono">{d.hardware_id}</td>
                <td>{d.label || '—'}</td>
                <td><span className={`tag ${d.status === 'online' ? 'verde' : 'vermelho'}`}>{d.status}</span></td>
                <td>{d.user_id ? nomeCliente(d.user_id) : <span className="suave">livre</span>}</td>
                <td className="suave">{d.firmware || '—'}</td>
                <td className="suave">{d.ultima_vez ? new Date(d.ultima_vez).toLocaleString('pt-BR') : 'nunca'}</td>
                <td><button className="botao secundario pequeno" onClick={() => setAssociando(d)}>Associar</button></td>
              </tr>
            ))}
            {devices.length === 0 && <tr><td colSpan={7} className="suave">Nenhuma placa cadastrada.</td></tr>}
          </tbody>
        </table>
      )}

      {cadastrando && <ModalCadastro aoFechar={() => setCadastrando(false)} aoSalvar={() => { setCadastrando(false); carregar() }} />}
      {associando && <ModalAssociar device={associando} clientes={clientes}
                                    aoFechar={() => setAssociando(null)}
                                    aoSalvar={() => { setAssociando(null); carregar() }} />}
    </div>
  )
}

function ModalCadastro({ aoFechar, aoSalvar }) {
  const [form, setForm] = useState({ hardware_id: '', label: '' })
  const [erro, setErro] = useState('')
  async function salvar(e) {
    e.preventDefault(); setErro('')
    try {
      await api.post('/admin/devices', { hardware_id: form.hardware_id, label: form.label || null })
      aoSalvar()
    } catch (err) { setErro(err.message) }
  }
  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <form className="cartao modal" onClick={(e) => e.stopPropagation()} onSubmit={salvar}>
        <h2>Cadastrar placa</h2>
        <p className="suave">O Hardware ID é o que aparece no monitor serial da placa (MAC sem os dois-pontos).</p>
        <label>Hardware ID
          <input value={form.hardware_id} onChange={(e) => setForm({ ...form, hardware_id: e.target.value })}
                 placeholder="B0A73227D15C" required minLength={4} className="mono" />
        </label>
        <label>Apelido (opcional)
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                 placeholder="Placa do jardim da frente" />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <div className="modal-botoes">
          <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario">Cadastrar</button>
        </div>
      </form>
    </div>
  )
}

function ModalAssociar({ device, clientes, aoFechar, aoSalvar }) {
  const [userId, setUserId] = useState(device.user_id || '')
  const [gardenId, setGardenId] = useState('')
  const [jardins, setJardins] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!userId) { setJardins([]); return }
    api.get(`/admin/clients/${userId}/gardens`).then(setJardins).catch((e) => setErro(e.message))
  }, [userId])

  async function salvar(e) {
    e.preventDefault(); setErro('')
    try {
      const corpo = userId ? { user_id: userId, garden_id: gardenId || null } : { user_id: null }
      await api.patch(`/admin/devices/${device.id}/assign`, corpo)
      aoSalvar()
    } catch (err) { setErro(err.message) }
  }

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <form className="cartao modal" onClick={(e) => e.stopPropagation()} onSubmit={salvar}>
        <h2>Associar placa</h2>
        <p className="suave mono">{device.hardware_id}</p>
        <label>Cliente
          <select value={userId} onChange={(e) => { setUserId(e.target.value); setGardenId('') }}>
            <option value="">— Desassociar (deixar livre) —</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.email})</option>)}
          </select>
        </label>
        {userId && (
          <label>Jardim (opcional, mas necessário para irrigar)
            <select value={gardenId} onChange={(e) => setGardenId(e.target.value)}>
              <option value="">— Não vincular a um jardim —</option>
              {jardins.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
            </select>
          </label>
        )}
        {userId && jardins.length === 0 && (
          <p className="aviso">Este cliente ainda não criou nenhum jardim no app.</p>
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
