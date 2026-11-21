import { useEffect, useId, useRef, useState } from 'react'

import { Botao } from '../../components/Botao.jsx'
import { Campo } from '../../components/Campo.jsx'
import { CarregandoA } from '../../components/CarregandoA.jsx'
import { useTituloAba } from '../../components/useTituloAba.js'
import { ROTULOS, textoDoErro, tomDe, useAcao } from './uteis.js'
import css from './app.module.css'

// Componentes comuns das telas da plataforma (/app): selo de status, cabeçalho, aviso,
// carregando, vazio, tabela e formulário.

export function Selo({ grupo, valor, tom, children }) {
  return <span className={`${css.selo} ${css[tom ?? tomDe(valor)]}`}>{children ?? ROTULOS[grupo]?.[valor] ?? valor}</span>
}

export function Cabecalho({ titulo, apoio, children }) {
  useTituloAba(`${titulo} · UrbanLink Flow`)
  return (
    <div className={css.cabecalho}>
      <meta name="robots" content="noindex" />
      <div>
        <h1 tabIndex={-1} className={css.h1}>
          {titulo}
        </h1>
        {apoio && <p className={css.apoio}>{apoio}</p>}
      </div>
      {children && <div className={css.acoesTopo}>{children}</div>}
    </div>
  )
}

export function Aviso({ erro, children }) {
  if (!erro && !children) return null
  return (
    <p className={css.aviso} role="alert">
      {children ?? textoDoErro(erro)}
    </p>
  )
}

export function Carregando({ texto = 'Carregando os dados' }) {
  return (
    <div className={css.carregando}>
      <CarregandoA texto={texto} />
    </div>
  )
}

export function Vazio({ children }) {
  return <p className={css.vazio}>{children}</p>
}

// Tabela com legenda (caption) e rolagem lateral no celular.
// colunas: [{ titulo, valor: (linha) => conteúdo, numero?: true }]
export function Tabela({ legenda, colunas, linhas, chave = (linha) => linha.id }) {
  return (
    <div className={css.tabelaCaixa} data-lenis-prevent="">
      <table className={css.tabela}>
        <caption className="so-leitor">{legenda}</caption>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.titulo} scope="col" className={coluna.numero ? css.num : undefined}>
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={chave(linha)}>
              {colunas.map((coluna) => (
                <td key={coluna.titulo} className={coluna.numero ? css.num : undefined}>
                  {coluna.valor(linha)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Formulário a partir de uma lista de campos. Os nomes são os da API, então o 422 marca o
// campo certo sem tradução.
// campo: { nome, label, tipo: text|number|email|password|select|datetime|checkbox|marcar,
//          opcoes: [[valor, texto]], passo, min, obrigatorio, ajuda, largo }
// "marcar" é uma lista de caixas (escolha várias) e devolve um array.
export function Formulario({ titulo, campos, inicial = {}, enviar, aoTerminar, textoBotao = 'Salvar' }) {
  const id = useId()
  const [valores, setValores] = useState(() => valoresIniciais(campos, inicial))
  const formulario = useRef(null)

  // O formulário abre no topo da tela; quem clicou numa linha lá embaixo não veria. O foco vai
  // pro primeiro campo, e o navegador rola até ele.
  useEffect(() => {
    formulario.current?.querySelector('input, select, textarea')?.focus()
  }, [])
  const [erros, setErros] = useState({})
  const { ocupado, erro, setErro, fazer } = useAcao()

  function mudar(nome, valor) {
    setValores((antes) => ({ ...antes, [nome]: valor }))
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErros({})
    const corpo = montarCorpo(campos, valores)
    let recusa = null
    const resposta = await fazer('enviar', async () => {
      try {
        return await enviar(corpo)
      } catch (falha) {
        recusa = falha
        throw falha
      }
    })
    if (recusa) {
      if (recusa.campos) setErros(mensagensDosCampos(campos, valores, recusa.campos))
      return
    }
    setErro(null)
    aoTerminar?.(resposta)
  }

  return (
    <form ref={formulario} className={css.formulario} onSubmit={aoEnviar} aria-labelledby={`${id}-titulo`} noValidate>
      <h2 id={`${id}-titulo`} className={css.h2}>
        {titulo}
      </h2>
      <div className={css.grade}>
        {campos.map((campo) => (
          <CampoForm
            key={campo.nome}
            campo={campo}
            valor={valores[campo.nome]}
            erro={erros[campo.nome]}
            mudar={(valor) => mudar(campo.nome, valor)}
          />
        ))}
      </div>
      <Aviso erro={erro} />
      <div className={css.botoes}>
        <Botao type="submit" tamanho="normal" carregando={ocupado === 'enviar'}>
          {ocupado ? 'Salvando…' : textoBotao}
        </Botao>
        {aoTerminar && (
          <Botao variante="link" tamanho="normal" onClick={() => aoTerminar(null)}>
            Cancelar
          </Botao>
        )}
      </div>
    </form>
  )
}

// Os campos simples usam o Campo do site (label, erro e ajuda ligados por aria-describedby).
// "marcar" é uma lista de caixas num fieldset, com a legenda como nome do grupo.
function CampoForm({ campo, valor, erro, mudar }) {
  const id = useId()
  const classe = campo.largo ? css.largo : ''

  if (campo.tipo === 'marcar') {
    const marcados = valor ?? []
    const idErro = erro ? `${id}-erro` : undefined
    const idAjuda = `${id}-ajuda`
    return (
      <fieldset className={`${css.marcarGrupo} ${css.largo}`} aria-describedby={[idErro, idAjuda].filter(Boolean).join(' ')}>
        <legend className={css.legenda}>{campo.label}</legend>
        {erro && (
          <p id={idErro} className={css.erroCampo}>
            {erro}
          </p>
        )}
        <p id={idAjuda} className={css.ajuda}>
          {campo.opcoes.length === 0 ? (campo.vazio ?? 'Nenhuma opção disponível.') : `${marcados.length} de ${campo.opcoes.length} marcadas.`}
        </p>
        <div className={css.marcarLista} data-lenis-prevent="">
          {campo.opcoes.map(([opcao, texto]) => (
            <label key={opcao} className={css.marcarItem}>
              <input
                type="checkbox"
                checked={marcados.includes(opcao)}
                onChange={(evento) =>
                  mudar(evento.target.checked ? [...marcados, opcao] : marcados.filter((item) => item !== opcao))
                }
              />
              <span>{texto}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (campo.tipo === 'checkbox') {
    return (
      <Campo
        tipo="checkbox"
        label={campo.label}
        ajuda={campo.ajuda}
        erro={erro}
        className={classe}
        checked={Boolean(valor)}
        onChange={(evento) => mudar(evento.target.checked)}
      />
    )
  }

  const tipo = campo.tipo === 'datetime' ? 'datetime-local' : (campo.tipo ?? 'text')
  return (
    <Campo
      tipo={tipo}
      label={campo.label}
      ajuda={campo.ajuda}
      erro={erro}
      opcional={!campo.obrigatorio}
      obrigatorio={campo.obrigatorio}
      className={classe}
      value={valor ?? ''}
      onChange={(evento) => mudar(evento.target.value)}
      step={campo.passo}
      min={campo.min}
      inputMode={campo.tipo === 'number' ? 'decimal' : undefined}
      autoComplete={campo.tipo === 'password' ? 'new-password' : 'off'}
    >
      {tipo === 'select' && (
        <>
          {!campo.obrigatorio && <option value="">Nenhum</option>}
          {campo.obrigatorio && valor === '' && (
            <option value="" disabled>
              Escolha
            </option>
          )}
          {campo.opcoes.map(([opcao, texto]) => (
            <option key={opcao} value={opcao}>
              {texto}
            </option>
          ))}
        </>
      )}
    </Campo>
  )
}

// O 422 diz quais campos a API recusou; o texto dela (do validador, em inglês) não vai pra tela.
// A mensagem sai do que está no campo: vazio, número, e-mail ou tamanho mínimo.
function mensagensDosCampos(campos, valores, recusados) {
  const mensagens = {}
  for (const [nome, textoApi] of Object.entries(recusados)) {
    const campo = campos.find((item) => item.nome === nome)
    const valor = valores[nome]
    const minimo = /(\d+) character/.exec(textoApi)?.[1]
    if (campo?.erro) mensagens[nome] = campo.erro
    else if (valor === '' || valor == null || (Array.isArray(valor) && valor.length === 0))
      mensagens[nome] = campo?.tipo === 'marcar' ? 'Marque pelo menos uma opção.' : 'Preencha este campo.'
    else if (campo?.tipo === 'number')
      mensagens[nome] = Number.isNaN(Number(String(valor).replace(',', '.'))) ? 'Digite um número.' : 'Use um número maior que zero.'
    else if (campo?.tipo === 'email') mensagens[nome] = 'Digite um e-mail válido, como nome@empresa.com.'
    else if (minimo) mensagens[nome] = `Use pelo menos ${minimo} caracteres.`
    else mensagens[nome] = 'Confira este campo.'
  }
  return mensagens
}

// datetime-local trabalha no horário do computador, sem fuso: "2026-11-20T18:30".
const paraCampoData = (iso) => {
  if (!iso) return ''
  const data = new Date(iso)
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function valoresIniciais(campos, inicial) {
  const valores = {}
  for (const campo of campos) {
    const valor = inicial[campo.nome] ?? campo.padrao
    if (campo.tipo === 'datetime') valores[campo.nome] = paraCampoData(valor)
    else if (campo.tipo === 'marcar') valores[campo.nome] = valor ?? []
    else if (campo.tipo === 'checkbox') valores[campo.nome] = Boolean(valor)
    else valores[campo.nome] = valor == null ? '' : String(valor)
  }
  return valores
}

function montarCorpo(campos, valores) {
  const corpo = {}
  for (const campo of campos) {
    const valor = valores[campo.nome]
    if (campo.tipo === 'marcar' || campo.tipo === 'checkbox') {
      corpo[campo.nome] = valor
      continue
    }
    if (valor === '' || valor == null) {
      if (campo.nuloQuandoVazio) corpo[campo.nome] = null
      continue
    }
    if (campo.tipo === 'number') corpo[campo.nome] = Number(String(valor).replace(',', '.'))
    else if (campo.tipo === 'datetime') corpo[campo.nome] = new Date(valor).toISOString()
    else corpo[campo.nome] = valor
  }
  return corpo
}
