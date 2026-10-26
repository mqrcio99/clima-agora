# Plano do Clima Agora Mobile

## Stack e decisões

| Área | Escolha | Motivo e trade-off |
| --- | --- | --- |
| Plataforma | React Native com Expo, em `mobile/` | Mantém o app web na raiz e permite desenvolvimento e builds Android gerenciados pelo Expo. |
| Linguagem | TypeScript | Tipagem ajuda a manter coerentes os dados da Open-Meteo, os estados do hook e as props dos componentes. |
| Navegação | Expo Router | Escolhido pelo arquiteto. A primeira versão terá uma tela principal e folhas/modais; a navegação fica pronta para futuras telas sem introduzir uma arquitetura de rotas própria. |
| Animação | `react-native-reanimated` | Permite animações nativas e efeitos de fundo com controle explícito de desempenho. O número e a complexidade de partículas serão limitados para reduzir o risco em Android de entrada. |
| Persistência | AsyncStorage | Adequado para guardar a cidade escolhida e um cache pequeno, sem justificar a integração adicional de MMKV. |
| Estado e dados | Hooks e Context quando compartilhamento for necessário | Escopo inicial de uma tela; evita introduzir TanStack Query sem uma necessidade atual de cache/revalidação mais ampla. |
| Estilo | `StyleSheet` e tokens de tema | Mantém o estilo nativo e os sete temas sem dependência de utilitários ou runtime de CSS-in-JS. |
| Serviços e lógica climática | Adaptar utilitários e serviços web; reescrever o hook para APIs nativas | Preserva a lógica climática existente. Geolocalização web e persistência de navegador não são portáveis para React Native. |
| Identidade | Nome `Clima Agora`; pacote `app.climaagora`; ícone e splash simples | Pacote fornecido pelo arquiteto. O ícone provisório será criado para o app. |
| Build e distribuição | EAS Build na nuvem; GitHub Releases e link do EAS | O build remoto dispensa Android Studio local. Release versionada e URL de build atendem diferentes formas de distribuição. |
| Testes | Jest e React Native Testing Library; Maestro depois | Prioriza testes rápidos de utilitários e componentes; deixa automação ponta a ponta para uma etapa futura. |
| Automação | GitHub Actions para lint e testes; build EAS acionado por tag | Automatiza qualidade e publicação. O segredo de autenticação EAS será configurado fora do repositório. |
| Idioma | Português do Brasil, textos organizados para futura tradução | Evita adicionar i18n antes de haver mais idiomas. |
| Interação horária | Toque mostra métricas, sem trocar temporariamente o fundo | Mantém o fundo coerente com o clima atual e evita temporizador e estado de simulação por hora. |
| Escopo | MVP descrito abaixo; widget, notificações de chuva e horas por dia ficam para depois | Entrega o fluxo meteorológico principal sem ampliar a navegação e as integrações. |

As versões do Expo SDK, React Native, Expo Router, Reanimated, AsyncStorage, Jest e das demais dependências serão decididas durante a implementação, após consulta à documentação oficial atual e à matriz de compatibilidade do Expo. Não se fixa uma versão neste plano.

## Escopo do MVP

- Localização do dispositivo com permissão em tempo de uso e mensagens claras para permissão negada ou falha.
- Busca manual de cidade como alternativa à localização.
- Clima atual, métricas relevantes, previsão diária de cinco dias e faixa horária horizontal.
- Faixa horária com resumo testável, probabilidade de chuva quando igual ou superior a 20%, marcadores de nascer/pôr do sol e detalhes de sensação térmica, umidade e vento ao tocar num horário.
- Sete temas climáticos: clear, rain, cold, snow, cloudy, night e storm.
- Fundo animado controlado, pausado em segundo plano e desativado ou reduzido quando o sistema indicar movimento reduzido. O toque numa hora não altera o fundo.
- Persistência da última cidade e cache da previsão para uso offline, com indicação de dados em cache quando aplicável.
- Estados de carregamento e erro, acessibilidade, adaptação de layout e playground de condições somente em desenvolvimento.
- Alertas locais existentes, adaptados se forem compatíveis com a experiência móvel.

## Estrutura proposta

```text
mobile/
  app/
    _layout.tsx
    index.tsx
  assets/
    icon.png
    adaptive-icon.png
    splash.png
  src/
    components/
      CitySearch/
      Forecast/
      HourlyForecast/
      LocationTransition/
      WeatherBackground/
      WeatherCard/
    hooks/
      useWeather.ts
    services/
      geocoding.ts
      weather.ts
    styles/
      themes.ts
      tokens.ts
    utils/
      alerts.ts
      hourlyForecast.ts
      storage.ts
      weatherCodes.ts
      weatherCondition.ts
    playground/
      Playground.tsx
    types/
      weather.ts
  __tests__/
  app.json
  eas.json
  package.json
  tsconfig.json
  README.md
```

Os caminhos podem ser ajustados para seguir o scaffold oficial do Expo Router e o resultado da configuração de testes, sem mover ou sobrescrever arquivos web.

## Mapa web → mobile

| Código web atual | Destino/alteração mobile |
| --- | --- |
| `src/app/App.jsx` | `mobile/app/index.tsx` e componentes de tela. A composição atual torna-se a rota principal; armazenamento e busca passam a usar serviços nativos. |
| `src/components/CitySearch/CitySearch.jsx` | `CitySearch`: campo e ação de busca em controles nativos; validação e acessibilidade móvel. |
| `src/components/WeatherCard/WeatherCard.jsx` | `WeatherCard`: clima atual, métricas, alertas e estados; recebe componentes nativos e tokens de tema. |
| `src/components/Forecast/Forecast.jsx` | `Forecast`: previsão diária de cinco dias. A faixa horária sai da lista de cartões atual e vira o componente separado abaixo. |
| Faixa horária atual em `src/components/Forecast/Forecast.jsx` | `HourlyForecast`: `FlatList` horizontal dentro do cartão principal, itens sem cartão/borda, encaixe por `snapToInterval`, chance de chuva condicional, marcadores de sol e detalhes ao toque. |
| `src/components/LocationTransition/LocationTransition.jsx` | `LocationTransition`: estado nativo de solicitação/localização e carregamento. |
| `src/components/WeatherBackground/WeatherBackground.jsx` | `WeatherBackground`: recriado com Reanimated e componentes nativos; sem canvas DOM. Pausa em background e respeita movimento reduzido. |
| `src/hooks/useWeather.js` | `useWeather.ts`: novo fluxo com `expo-location`, cancelamento/controle de atualizações, busca manual, cache AsyncStorage, estados de erro e atualização periódica. Não reutilizar APIs de navegador. |
| `src/services/weather.js` | `services/weather.ts`: manter Open-Meteo sem chave e cache; solicitar campos horários requeridos, `daily` com sunrise/sunset, `forecast_days=5` e `timezone=auto`. Mapear arrays paralelos em objetos horários tipados e filtrar a partir da hora atual no fuso consultado. |
| `src/services/geocoding.js` | `services/geocoding.ts`: preservar busca de coordenadas pela Open-Meteo e a geocodificação reversa atual, salvo decisão técnica necessária documentada. |
| `src/utils/weatherCondition.js`, `src/utils/weatherCodes.js` | Portar e tipar sem alterar regras de classificação; manter testes de regressão. |
| `src/utils/hourlyForecast.js` | Adaptar para dados horários mapeados, fuso local da consulta, frase-resumo pura, condições, limites de chuva e marcadores do sol; corrigir diferenças do fuso do dispositivo com testes. |
| `src/utils/alerts.js` | Portar regras de alertas locais, mantendo seus limites e testes existentes. |
| `src/utils/storage.js` | Adaptar de `localStorage` para AsyncStorage. Persistir cidade e cache da última previsão; testar comportamento de ausência e falha de armazenamento. |
| `src/styles/tokens.css`, `src/styles/themes.css` | Tokens e temas TypeScript para os sete estados, cores, gradientes, tipografia, espaçamento e superfícies em `StyleSheet`. Verificar contraste AA. |
| `src/playground/Playground.jsx` | `Playground.tsx`, renderizado exclusivamente em `__DEV__`, com mock para cada condição e opção de desligar animações. |
| `src/utils/tests/*.test.js` | Adaptar para Jest; adicionar testes de mapeamento da API, filtragem horária com fuso diferente, resumo, marcadores de nascer/pôr do sol, hook e componentes relevantes. |
| `e2e/responsiveness.spec.js` | Não portar Playwright web como teste de app. Maestro fica fora do MVP; validar layouts por testes de componentes e inspeção em emuladores disponíveis. |

## Dependências previstas

As versões finais serão verificadas na documentação oficial durante a Fase 3.

- Base e navegação: `expo`, `react`, `react-native`, `expo-router`.
- Localização e persistência: `expo-location`, `@react-native-async-storage/async-storage`.
- Animação: `react-native-reanimated`.
- Testes: Jest compatível com Expo, React Native Testing Library e ferramentas de preset/configuração recomendadas oficialmente.
- Desenvolvimento: TypeScript, ESLint e Prettier com configurações compatíveis com a versão de Expo escolhida.
- Build: EAS CLI via `npx` e configuração `eas.json`; não requer dependência global ou credencial no repositório.
- CI: GitHub Actions para instalação, lint e testes; build EAS por tag dependerá de segredo configurado pelo proprietário do repositório.

Não estão previstas dependências de navegação além do Expo Router, state manager, biblioteca de ícones ou sistema de estilo adicional, salvo necessidade identificada durante a implementação.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Compatibilidade entre versões do Expo SDK, Router, Reanimated, TypeScript e ferramentas de teste | Consultar documentação e matriz oficial atual antes de instalar; validar com Expo Doctor. |
| Divergência de fuso ao selecionar horas | Tratar os horários com o fuso retornado pela consulta, evitando interpretar strings locais como UTC; cobrir com testes para fuso diferente do dispositivo. |
| Reanimated/partículas afetarem dispositivos de entrada | Limitar elementos e trabalho por frame; permitir animação desligada, respeitar movimento reduzido e pausar em segundo plano. |
| Cache antigo ou falha offline apresentada como previsão atual | Registrar instante do cache e indicar claramente que os dados são armazenados; propagar erros de leitura/gravação de acordo com o padrão escolhido, sem fallback silencioso. |
| Contraste insuficiente em algum tema ou texto ampliado quebrar layout | Medir contraste AA por combinação, usar layouts flexíveis, safe areas e validar tamanhos de tela e fonte. |
| API de geocodificação reversa de terceiro indisponível | Tratar falha explicitamente e preservar coordenadas/localidade já disponíveis, sem impedir a consulta do tempo quando a previsão tiver sucesso. |
| Credenciais de build/Release | Manter keystore sob gestão EAS e tokens apenas em segredos do GitHub; nunca versionar credenciais. |
| Fila de build gratuita | A página oficial de preços consultada informa até 15 builds Android e 15 iOS no Free, fila de baixa prioridade, limite de 45 minutos por build e possível espera acima de 90 minutos no pico; checar a página de fila novamente no momento do build. |

## Etapas de execução e critérios de pronto

Cada etapa deve ocorrer na branch `feat/versao-mobile`, em um commit semântico separado. Ao final de cada etapa, rodar lint, checagem de tipos disponível e testes relevantes; registrar exceções se alguma verificação ainda não existir naquela etapa.

1. **Fundação Expo e documentação de decisões**
   - Criar `mobile/` sem modificar os arquivos existentes do site; configurar Expo Router, TypeScript, lint, formatação, testes, identidade inicial e `.gitignore` para segredos/artefatos.
   - Criar `docs/DECISOES.md` com motivos das bibliotecas e camadas selecionadas.
   - Pronto: projeto inicia no Expo, lint/tipos/testes básicos passam, documentação registra stack e nenhuma credencial está no repositório.

2. **Serviços, modelos, persistência e testes**
   - Portar geocodificação, consulta Open-Meteo, classificação climática, alertas e armazenamento; implementar o modelo horário e resumo com seus casos de fuso e sol.
   - Pronto: testes unitários cobrem mapeamento, condições sem alteração, cache e armazenamento, filtragem por fuso, frase e marcadores solares.

3. **Temas, tela principal e previsão**
   - Criar tokens e sete temas, cartão atual, estados de carregamento/erro, faixa horária horizontal dentro do cartão, detalhes ao toque e cinco dias.
   - Pronto: dados reais alimentam componentes tipados; layouts funcionam em telas pequenas/grandes, paisagem e tablets; alvos, fonte ampliada e contraste são verificados.

4. **Localização, animação e playground**
   - Integrar `expo-location`, busca manual, persistência de cidade/cache, ciclo de atualização e estados de permissão; implementar pausa de animações e playground apenas em desenvolvimento.
   - Pronto: permissão negada oferece busca manual, animação para em segundo plano/respeita movimento reduzido e todos os sete cenários podem ser exercitados com mock.

5. **Qualidade, CI e documentação de uso**
   - Completar testes, workflows de lint/teste e build por tag conforme opção escolhida; criar README mobile com execução, arquitetura, imagens dos temas/faixa e próximos passos; resolver marcadores de conflito existentes no README raiz preservando seu conteúdo e adicionar link para mobile.
   - Pronto: CI executa lint e testes; documentação permite instalar dependências, rodar no Expo Go/emulador e entende o fluxo de build.

6. **Configuração e entrega do APK**
   - Configurar `app.json` e `eas.json`, incluindo perfil `preview` APK para distribuição interna e `production` separado; consultar os campos oficiais atuais.
   - Rodar `npx expo-doctor`, lint, tipos e testes; corrigir os problemas reportados.
   - Parar para o proprietário executar autenticação e build EAS. Não realizar login em nome do proprietário nem armazenar credenciais.
   - Após o APK ser gerado pelo proprietário, documentar instalação, Android mínimo suportado, tamanho observado e caráter demonstrativo, além do fluxo de Release escolhido.
   - Pronto: health check e verificações passam; perfil e comandos estão documentados; artefato e seus metadados são confirmados pelo resultado real do build, sem alegar testes de dispositivo que não tenham sido feitos.

## Referências oficiais para decisões de build

- [Preços EAS](https://expo.dev/pricing) — plano Free, contagem de builds, timeout e prioridade/fila.
- [Introdução ao EAS Build](https://docs.expo.dev/build/introduction/) — serviço de build em nuvem.
- [Configuração do eas.json](https://docs.expo.dev/build/eas-json/) — perfis de build.
- [Build de APK para Android](https://docs.expo.dev/build-reference/apk/) — `distribution: "internal"` e `android.buildType: "apk"`.

As referências serão consultadas novamente antes da implementação e configuração do build, pois os detalhes e versões do Expo mudam.
