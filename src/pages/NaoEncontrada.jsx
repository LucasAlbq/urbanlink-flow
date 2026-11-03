import { Botao } from '../components/Botao.jsx'
import { Placa } from '../components/estrada/Placa.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import css from './nao-encontrada/NaoEncontrada.module.css'

// Página não encontrada (prancha Pagina-404). Texto em docs/plano/03-telas-e-estados.md.
export function NaoEncontrada() {
  useTituloAba('Página não encontrada · UrbanLink Flow')

  return (
    <>
      <section className={css.topo}>
        <div className={css.topoDentro}>
          <h1 tabIndex={-1} className={css.h1}>
            Essa rua não existe.
          </h1>
          <p className={css.apoio}>
            O endereço que você abriu não leva a nenhuma página do site. Pode ser um link digitado errado ou
            uma página que mudou de lugar.
          </p>
        </div>
      </section>

      <section className={css.corpo}>
        <div className={css.dentro}>
          <EstradaSemSaida />
          <div className={css.acoes}>
            <Botao href="/" variante="noite" className={css.voltar}>
              Voltar para o início
            </Botao>
            <Botao href="/rastreamento" variante="link" className={css.link}>
              Rastrear uma entrega
            </Botao>
            <Botao href="/contato" variante="link" className={css.link}>
              Falar com a gente
            </Botao>
          </div>
        </div>
      </section>
    </>
  )
}

// A estrada da prancha: o pacote anda até a placa de Retorno, e depois dela a rua
// é só um contorno tracejado. Decorativa; a placa é a Placa de verdade.
function EstradaSemSaida() {
  return (
    <div className={css.estrada} aria-hidden="true">
      <div className={css.trecho}>
        <div className={css.poste}>
          <Placa nome="Retorno" glifo="retorno" estado="atual" />
          <div className={css.haste} />
        </div>
        <div className={css.asfalto}>
          <span className={css.faixa} />
          <span className={css.pacote} data-pacote="" />
        </div>
      </div>
      <div className={css.semSaida} />
    </div>
  )
}
