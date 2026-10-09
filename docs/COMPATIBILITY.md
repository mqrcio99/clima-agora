# Compatibilidade do app

| Recurso                       | Uso no app                       | Fallback                                        | Suporte esperado                                                         |
| ----------------------------- | -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| `fetch`                       | Busca do clima e geocodificação  | Mensagem de erro em navegadores antigos         | Chrome 69+, Firefox 69+, Safari 13+, Edge 79+, Samsung Internet recente  |
| `AbortController`             | Não obrigatório no fluxo atual   | Requisição segue sem cancelamento manual        | Presente em navegadores atuais; ausência simplifica fluxo sem quebrar    |
| `Intl`                        | Formatação dos dias da semana    | Usa `toDateString()` em fallback simples        | Chrome 69+, Firefox 69+, Safari 13+, Edge 79+                            |
| `IntersectionObserver`        | Não usado no código atual        | Sem lazy-loading observável                     | Em navegadores modernos; não bloqueia render                             |
| `requestAnimationFrame`       | Animação do fundo do clima       | A interface continua estável sem efeito animado | Presente em todos os navegadores alvos                                   |
| `100dvh`                      | Altura dinâmica da tela          | `100vh` como fallback                           | Suporte moderno; fallback preserva layout em navegadores mais antigos    |
| `env(safe-area-inset-*)`      | Ajuste de notch e arredondamento | Padding padrão da UI                            | iOS 11+, navegadores modernos                                            |
| `backdrop-filter`             | Vidro translúcido dos cards      | Fundo sólido do mesmo tom                       | Chrome 76+, Safari 15+, Edge 79+; fallback visual em navegadores antigos |
| `clamp()`                     | Tipografia fluida                | tamanhos fixos via `font-size` normal           | Chrome 79+, Firefox 75+, Safari 13+, Edge 79+                            |
| `aspect-ratio`                | Não utilizado diretamente        | Layout não depende do recurso                   | Suporte geral moderado                                                   |
| `gap` em flex                 | Espaçamento dos botões e buscas  | `display: block` e margens alternadas           | Suporte amplo em navegadores atuais                                      |
| `canvas` + `devicePixelRatio` | Partículas do fundo do clima     | Render mais simples sem excesso de pixels       | Compatível com TVs e desktops modernos                                   |
