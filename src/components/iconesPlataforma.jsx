// As quatro áreas da plataforma e os ícones delas (traço fino, um conjunto só), os mesmos da
// ilustração da landing. Usados no menu de /app e na seção "Por dentro da plataforma".
export const AREAS_PLATAFORMA = [
  {
    nome: 'Monitoramento',
    caminho: '/app',
    icone: (
      <>
        <circle cx="12" cy="10" r="3" />
        <path d="M 12 21 C 12 21 5 14.5 5 10 A 7 7 0 0 1 19 10 C 19 14.5 12 21 12 21 Z" />
      </>
    ),
  },
  {
    nome: 'Rotas',
    caminho: '/app/rotas',
    icone: (
      <>
        <circle cx="6" cy="18" r="2.5" />
        <path d="M 8.5 18 H 15 A 3.5 3.5 0 0 0 15 11 H 9 A 3.5 3.5 0 0 1 9 4 H 15" />
        <path d="M 15 1.5 L 18 4 L 15 6.5" />
      </>
    ),
  },
  {
    nome: 'Simulação',
    caminho: '/app/simulacao',
    icone: (
      <>
        <path d="M 4 19 H 20" />
        <path d="M 4 15 L 9 9 L 13 13 L 20 5" />
        <path d="M 16 5 H 20 V 9" />
      </>
    ),
  },
  {
    nome: 'Cadastros',
    caminho: '/app/cadastros',
    icone: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M 8 8 H 16 M 8 12 H 16 M 8 16 H 13" />
      </>
    ),
  },
]
