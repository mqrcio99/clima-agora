# 🌤️ Clima Agora

> Aplicação de clima responsiva, com tema visual dinâmico e dados em tempo real, pensada para celular, tablet, desktop e TVs.

[![Deploy na Vercel](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)](https://clima-agora-olive.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-1E88E5)](https://open-meteo.com)

🔗 **Demo ao vivo:** [clima-agora-olive.vercel.app](https://clima-agora-olive.vercel.app)

---

## 📌 Sobre o projeto

O **Clima Agora** consome dados em tempo real da API [Open-Meteo](https://open-meteo.com) e adapta toda a interface à condição climática atual: o tema visual muda conforme o tempo (sol, chuva, nublado e assim por diante). O foco do projeto está em **responsividade, UX e compatibilidade entre dispositivos**, incluindo um modo dedicado para TVs e telas grandes.

## ✨ Funcionalidades

- 🔍 **Busca por cidade**
- 📍 **Geolocalização** com fallback seguro caso o usuário negue a permissão
- 💾 **Armazenamento do último local consultado**
- 📅 **Previsão dos próximos 5 dias**
- 🎨 **Tema visual dinâmico** por condição meteorológica
- 📺 **Modo TV** para telas grandes
- 🧪 **Playground de desenvolvimento** para simular cenários climáticos
- 🌐 **Compatibilidade** com navegadores recentes e suporte a navegadores mais antigos

## 🛠️ Stack

| Camada | Tecnologia |
| --- | --- |
| Interface | React 19 |
| Build e dev server | Vite 8 |
| Linguagem | JavaScript |
| Dados | API Open-Meteo |
| Hospedagem | Vercel |

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/clima-agora.git
cd clima-agora

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`. Não é necessário configurar chave de API: o Open-Meteo é aberto e gratuito.

### Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run check` | Executa as verificações do projeto |
| `npm run test` | Executa os testes |

## 🧪 Playground

O playground é um painel de simulação que permite testar o visual da aplicação em diferentes condições climáticas sem depender do tempo real. Ele está disponível apenas em ambiente de desenvolvimento.

Para abrir o painel, adicione `?playground` à URL:

```text
http://localhost:5173/?playground
```

Para ativar uma condição específica, use o parâmetro `debug`:

```text
http://localhost:5173/?playground&debug=rain
```

## 📁 Estrutura principal

```text
src/
  app/          # composição e configuração da aplicação
  components/   # componentes de interface
  hooks/        # hooks reutilizáveis
  playground/   # simulador de cenários climáticos
  services/     # acesso à API Open-Meteo
  styles/       # estilos e temas
  utils/        # funções utilitárias
```

## 🎯 Destaques técnicos

- **Responsividade real:** layout pensado para celular, tablet, desktop e TV
- **Resiliência:** geolocalização com fallback seguro e persistência do último local
- **Experiência dinâmica:** o tema visual acompanha a condição meteorológica
- **Ferramenta de desenvolvimento própria:** playground para testar cenários sem esperar o clima mudar
- **Qualidade:** scripts de verificação e testes automatizados
- **Organização:** código separado por responsabilidade (serviços, hooks, componentes e utilitários)

## 📝 Observações

O projeto foi desenvolvido para apresentação acadêmica e demonstração de boas práticas em responsividade, UX e compatibilidade entre diferentes dispositivos.

## 👤 Autor

**Marcio Oliveira**

---

