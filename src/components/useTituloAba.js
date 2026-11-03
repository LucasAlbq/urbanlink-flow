import { useEffect } from 'react'

// Troca o título da aba do navegador quando a página monta.
export function useTituloAba(titulo) {
  useEffect(() => {
    document.title = titulo
  }, [titulo])
}
