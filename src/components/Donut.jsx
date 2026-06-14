// Gráfico de rosca em SVG puro (sem biblioteca). Recebe fatias [{label, valor, cor}].
export default function Donut({ fatias, tamanho = 180, espessura = 28 }) {
  const total = fatias.reduce((s, f) => s + f.valor, 0)
  const raio = (tamanho - espessura) / 2
  const circ = 2 * Math.PI * raio
  const centro = tamanho / 2

  let offset = 0
  const segmentos = total > 0 ? fatias.filter((f) => f.valor > 0).map((f) => {
    const fracao = f.valor / total
    const seg = {
      cor: f.cor,
      dash: fracao * circ,
      gap: circ - fracao * circ,
      rotacao: (offset / total) * 360,
    }
    offset += f.valor
    return seg
  }) : []

  return (
    <div className="donut-wrap">
      <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`}>
        <circle cx={centro} cy={centro} r={raio} fill="none" stroke="#eef2f7" strokeWidth={espessura} />
        {segmentos.map((s, i) => (
          <circle key={i} cx={centro} cy={centro} r={raio} fill="none"
                  stroke={s.cor} strokeWidth={espessura}
                  strokeDasharray={`${s.dash} ${s.gap}`}
                  transform={`rotate(${s.rotacao - 90} ${centro} ${centro})`} />
        ))}
        <text x={centro} y={centro - 4} textAnchor="middle" className="donut-num">{total}</text>
        <text x={centro} y={centro + 16} textAnchor="middle" className="donut-leg">clientes</text>
      </svg>
      <ul className="legenda">
        {fatias.map((f) => (
          <li key={f.label}>
            <span className="ponto" style={{ background: f.cor }} />
            {f.label} <strong>{f.valor}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
