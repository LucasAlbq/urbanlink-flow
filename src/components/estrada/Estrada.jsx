import { Etapa } from './Etapa.jsx'
import css from './Estrada.module.css'

// A estrada com placas. Cada item de `etapas`:
// { id, placa: { numero, nome, glifo, estado }, trecho, conteudo }
// orientacao: auto (horizontal, vira vertical abaixo de 760 px) · vertical.
// inicio: ponto amarelo no começo. fim: seta no fim (Ouro, ou clara se o último trecho for futuro).
// pacoteEm: índice da etapa com o pacote, ou 'fim' (pacote na seta).
export function Estrada({ etapas, orientacao = 'auto', inicio = true, fim = true, pacoteEm, className = '', ...resto }) {
  const ultima = etapas.length - 1

  return (
    <ol
      className={`${css.estrada} ${orientacao === 'vertical' ? css.vertical : css.auto} ${className}`}
      style={{ '--etapas': etapas.length }}
      data-estrada=""
      {...resto}
    >
      {etapas.map((etapa, i) => (
        <Etapa
          key={etapa.id ?? i}
          placa={etapa.placa}
          trecho={etapa.trecho}
          inicio={inicio && i === 0}
          fim={fim && i === ultima}
          pacote={pacoteEm === i || (pacoteEm === 'fim' && i === ultima && 'fim')}
        >
          {etapa.conteudo}
        </Etapa>
      ))}
    </ol>
  )
}
