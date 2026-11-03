import { Etapa } from './Etapa.jsx'
import css from './Estrada.module.css'

// A estrada com placas. Cada item de `etapas`:
// { id, placa: { numero, nome, glifo, estado }, trecho, conteudo }
// orientacao: auto (horizontal, vira vertical abaixo de 760 px) · vertical.
// inicio: ponto amarelo no começo. fim: seta Ouro no fim. pacoteEm: índice da etapa com o pacote.
export function Estrada({ etapas, orientacao = 'auto', inicio = true, fim = true, pacoteEm, className = '' }) {
  const ultima = etapas.length - 1

  return (
    <ol
      className={`${css.estrada} ${orientacao === 'vertical' ? css.vertical : css.auto} ${className}`}
      style={{ '--etapas': etapas.length }}
      data-estrada=""
    >
      {etapas.map((etapa, i) => (
        <Etapa
          key={etapa.id ?? i}
          placa={etapa.placa}
          trecho={etapa.trecho}
          inicio={inicio && i === 0}
          fim={fim && i === ultima}
          pacote={pacoteEm === i}
        >
          {etapa.conteudo}
        </Etapa>
      ))}
    </ol>
  )
}
