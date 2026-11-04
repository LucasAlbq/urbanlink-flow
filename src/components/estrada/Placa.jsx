import css from './Placa.module.css'

// Glifos desenhados nas pranchas. seta = a seta da marca; desvio = trecho que muda de rumo;
// check = etapa feita (rastreamento); retorno = volta (página 404).
const GLIFOS = {
  seta: (
    <svg viewBox="0 0 64 60" className={css.seta} aria-hidden="true" focusable="false">
      <path d="M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z" />
    </svg>
  ),
  desvio: (
    <svg viewBox="0 0 26 22" className={css.desvio} aria-hidden="true" focusable="false">
      <path d="M 2 18 H 9 L 15 6 H 22" />
      <path d="M 18 1.5 L 23.5 6 L 18 10.5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" className={css.check} aria-hidden="true" focusable="false">
      <path d="M 4 12.5 L 9.5 18 L 20 6.5" />
    </svg>
  ),
  retorno: (
    <svg viewBox="0 0 26 24" className={css.retorno} aria-hidden="true" focusable="false">
      <path d="M 19 22 V 10 A 6 6 0 0 0 7 10 V 17" />
      <path d="M 2.5 13 L 7 17.5 L 11.5 13" />
    </svg>
  ),
}

// estado: normal (Ouro) · feito (Ouro, glifo check) · atual (Amarelo) · proximo (só contorno).
// tamanho: normal (jornada) · pequeno (rastreamento). glifo: null tira o glifo.
// Sem `numero`, a placa fica só com o nome e o glifo (Retorno, na 404).
// rotuloEstado: texto só pra leitor de tela ("feita", "etapa atual"…).
export function Placa({ numero, nome, glifo = 'seta', estado = 'normal', tamanho = 'normal', rotuloEstado }) {
  const semNumero = numero === undefined || numero === null
  const classes = [css.placa, css[estado], tamanho === 'pequeno' && css.pequeno, semNumero && css.semNumero]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} data-placa="" data-estado={estado}>
      {!semNumero && <span className={css.numero}>{numero}</span>}
      <span className={css.nome}>
        {nome}
        {rotuloEstado && <span className="so-leitor">, {rotuloEstado}</span>}
      </span>
      {glifo && GLIFOS[glifo]}
    </div>
  )
}
