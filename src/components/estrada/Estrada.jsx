import { Etapa } from './Etapa.jsx'
import css from './Estrada.module.css'

// A estrada com placas. Cada item de `etapas`:
// { id, placa: { numero, nome, glifo, estado }, trecho, conteudo }
// orientacao: auto (horizontal, vira vertical abaixo de 760 px) · vertical.
// inicio: ponto amarelo no começo. fim: seta no fim (Ouro, ou clara se o último trecho for futuro).
// pacoteEm: índice da etapa com o pacote, ou 'fim' (pacote na seta).
// variante="menu": a estrada do menu do celular (asfalto Marinho, pacote no meio da parada).
// paradas: ponto no asfalto das etapas sem o pacote.
export function Estrada({
  etapas,
  orientacao = 'auto',
  variante = 'normal',
  inicio = true,
  fim = true,
  pacoteEm,
  paradas = false,
  className = '',
  ...resto
}) {
  const ultima = etapas.length - 1
  const classes = [
    css.estrada,
    orientacao === 'vertical' ? css.vertical : css.auto,
    variante === 'menu' && css.menu,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <ol
      className={classes}
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
          parada={paradas}
        >
          {etapa.conteudo}
        </Etapa>
      ))}
    </ol>
  )
}
