import { USAR_EXEMPLOS } from '../api/cliente.js'
import css from './FaixaExemplos.module.css'

// Aviso fixo quando a tela usa dados de exemplo (04-api-e-dados.md). Some no build.
export function FaixaExemplos() {
  if (!USAR_EXEMPLOS) return null
  return <p className={css.faixa}>Dados de exemplo</p>
}
