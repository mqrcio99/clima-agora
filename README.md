# Clima Agora

Aplicação de clima responsiva em React + Vite, com visual adaptado para celular, tablet, desktop e TVs. A interface usa dados em tempo real da API Open-Meteo e mantém o tema visual alinhado com a condição climática atual.

## Funcionalidades

- Busca por cidade
- Geolocalização com fallback seguro
- Armazenamento do último local consultado
- Previsão dos próximos 5 dias
- Tema visual dinâmico por condição meteorológica
- Modo de TV e telas grandes
- Playground de desenvolvimento para simular cenários climáticos
- Compatibilidade com navegadores recentes e suporte para navegadores mais antigos

## Stack

- React 19
- Vite 8
- JavaScript
- Open-Meteo API

## Scripts

```bash
npm install
npm run dev
npm run build
npm run check
npm run test
```

## Playground

Para abrir o painel de simulação, adicione `?playground` na URL da aplicação em ambiente de desenvolvimento.

Exemplo:

```bash
http://localhost:5173/?playground
```

Também é possível ativar uma condição específica com o parâmetro `debug`:

```bash
http://localhost:5173/?playground&debug=rain
```

## Estrutura principal

```text
src/
  app/
  components/
  hooks/
  playground/
  services/
  styles/
  utils/
```

## Observações

O projeto foi pensado para apresentação acadêmica e demonstração de boas práticas em responsividade, UX e compatibilidade entre diferentes dispositivos.
