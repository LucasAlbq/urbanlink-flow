import css from './Placa.module.css'

// Glifos desenhados nas pranchas. seta = a seta da marca; desvio = trecho que muda de rumo;
// check = etapa feita (rastreamento). retorno chega com a 404.
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
}

// estado: normal (Ouro) · feito (Ouro, glifo check) · atual (Amarelo) · proximo (só contorno).
// tamanho: normal (jornada) · pequeno (rastreamento). glifo: null tira o glifo.
// rotuloEstado: texto só pra leitor de tela ("feita", "etapa atual"…).
export function Placa({ numero, nome, glifo = 'seta', estado = 'normal', tamanho = 'normal', rotuloEstado }) {
  return (
    <div className={`${css.placa} ${css[estado] ?? ''} ${tamanho === 'pequeno' ? css.pequeno : ''}`} data-placa="">
      <span className={css.numero}>{numero}</span>
      <span className={css.nome}>
        {nome}
        {rotuloEstado && <span className="so-leitor">, {rotuloEstado}</span>}
      </span>
      {glifo && GLIFOS[glifo]}
    </div>
  )
}
