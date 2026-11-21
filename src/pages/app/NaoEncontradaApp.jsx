import { Botao } from '../../components/Botao.jsx'
import { Cabecalho } from './pecas.jsx'

// Endereço errado dentro de /app: fica na moldura da plataforma, com o caminho de volta.
export default function NaoEncontradaApp() {
  return (
    <>
      <Cabecalho titulo="Página não encontrada" apoio="Esse endereço não existe na plataforma, ou teu perfil não tem acesso a ele." />
      <Botao href="/app" variante="noite" tamanho="normal">
        Voltar pro Monitoramento
      </Botao>
    </>
  )
}
