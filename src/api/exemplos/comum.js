// Peças dos dados de exemplo (só com VITE_USAR_EXEMPLOS=true, nunca no build).

// Espera como se fosse a rede, pra dar tempo de ver o "Enviando…" e o A da espera.
export const esperar = (ms, sinal) =>
  new Promise((ok, falha) => {
    const t = setTimeout(ok, ms)
    sinal?.addEventListener('abort', () => {
      clearTimeout(t)
      falha(sinal.reason)
    })
  })

// O começo do e-mail escolhe a resposta: "sem-conexao@…", "muitas@…" etc.
export const gatilho = (email = '') => email.trim().toLowerCase().split('@')[0]
