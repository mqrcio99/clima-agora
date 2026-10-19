# Decisões técnicas

Este documento registra os motivos das bibliotecas e camadas escolhidas para o app mobile. As versões exatas são as compatíveis com o Expo SDK 57 selecionado após consulta à documentação oficial em 19/10/2026; atualizar SDK exige rever a matriz de compatibilidade e as instruções correspondentes.

## Plataforma e organização

- **React Native com Expo:** permite desenvolver e distribuir um APK Android sem manter projetos nativos paralelos à mão. Configurações nativas devem ser feitas via `app.json` e config plugins, mantendo Continuous Native Generation.
- **Pasta `mobile/`:** separa dependências e scripts do site React/Vite atual, sem converter o repositório inteiro em monorepo.
- **Expo Router:** escolhido pelo arquiteto. Mantém rotas baseadas em arquivos e deixa uma estrutura de navegação pronta para futuras telas; o MVP expõe somente a tela principal.
- **TypeScript estrito:** reduz erros de formato nos dados paralelos da API e nas props; aplicado apenas ao código mobile.
- **`StyleSheet` e tokens próprios:** estilos nativos tipados, reutilizáveis nos sete temas, sem runtime CSS-in-JS ou classes utilitárias adicionais.

## Bibliotecas de runtime

| Biblioteca                                          | Uso e justificativa                                                                                                                                                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expo`                                              | Runtime e ferramentas da plataforma Expo, incluindo comandos de desenvolvimento e integração com módulos nativos. SDK 57 mantém compatibilidade com Expo Go em aparelho físico durante a transição oficial para SDK 58. |
| `expo-router`                                       | Rotas da aplicação, configuração de stack e integração de deep links.                                                                                                                                                   |
| `expo-location`                                     | Solicitar permissão em primeiro plano e obter coordenadas para a consulta meteorológica; o app não requer localização em segundo plano.                                                                                 |
| `@react-native-async-storage/async-storage`         | Persistir a última cidade e o cache pequeno da última previsão entre reinicializações. Cache meteorológico não é dado secreto; AsyncStorage não oferece criptografia.                                                   |
| `react-native-reanimated` e `react-native-worklets` | Animações de fundo executadas no runtime de animação, com limitação de partículas e controle de pausa/acessibilidade. Worklets é o runtime complementar exigido pela versão do Reanimated alinhada ao SDK 57.           |
| `react-native-safe-area-context`                    | Respeitar recortes, barras do sistema e safe areas em diferentes dispositivos.                                                                                                                                          |
| `react-native-screens`                              | Integração nativa de telas usada pela navegação Expo Router.                                                                                                                                                            |
| `react-native-gesture-handler`                      | Infraestrutura de gestos usada pelo stack/navigation do Expo Router.                                                                                                                                                    |
| `expo-linking` e `expo-constants`                   | Integrações de links, rotas e metadados consumidas pelo Expo Router.                                                                                                                                                    |
| `expo-splash-screen`                                | Controlar a tela de abertura enquanto o app inicializa.                                                                                                                                                                 |
| `expo-status-bar`                                   | Adaptar o estilo dos ícones da barra de status aos temas climáticos.                                                                                                                                                    |
| `expo-system-ui`                                    | Definir cores do sistema compatíveis com o tema e o fundo da tela.                                                                                                                                                      |
| `react-dom` e `react-native-web`                    | Manter o preview universal de desenvolvimento pelo navegador que acompanha o Expo Router; o APK continua sendo o artefato principal e não recebe o runtime web.                                                         |

React e React Native são a base de interface e não são camadas opcionais. Não se adotou TanStack Query, React Navigation em paralelo ao Router, MMKV, Skia, NativeWind, styled-components, Lottie, biblioteca de ícones ou armazenamento criptografado: o escopo não justifica os custos adicionais.

## Dados, rede e comportamento

- **Open-Meteo:** fonte meteorológica e de busca de cidades sem chave de API. O serviço mobile encapsula a API e mapeia os arrays horários para objetos tipados.
- **Compatibilidade dos alertas:** a consulta mantém `minutely_15=precipitation` e a precipitação horária do site. Esse dado é mapeado separadamente, sem ampliar o formato público exigido para cada item horário.
- **BigDataCloud reverse geocoding:** mantido do site para obter nome aproximado a partir das coordenadas, sujeito à disponibilidade do serviço. A previsão não deve depender do sucesso dessa resolução de nome.
- **Hooks React e estado local:** suficientes para a tela, pesquisa, carregamento e seleção de detalhes da hora; Context só será introduzido se houver estado realmente compartilhado.
- **Cache AsyncStorage próprio:** guarda a última previsão e seu instante de captura para permitir visualização offline com indicação de dados possivelmente desatualizados; não é uma base de dados geral.
- **Nenhum i18n no MVP:** textos em português brasileiro, agrupados para permitir internacionalização futura sem adicionar dependência antes de haver outros idiomas.

## Desenvolvimento, testes e distribuição

- **`jest-expo` + Jest:** preset oficial Expo para testar módulos e componentes sem executar um dispositivo nativo.
- **React Native Testing Library:** testes de interação/renderização por comportamento acessível, em vez de detalhes internos.
- **`test-renderer` 1.2.x:** implementação usada pela versão atual da React Native Testing Library; permanece alinhada ao React 19.2 do SDK 57, evitando a versão mais recente que exige React 19.3.
- **ESLint com `eslint-config-expo`:** padrões de React Native/Expo e hooks adequados à plataforma.
- **Prettier e plugin ESLint:** formatação consistente e verificável no mesmo comando de qualidade.
- **EAS Build:** compilar e assinar na nuvem sem exigir Android Studio/JDK para o build de distribuição. O EAS gerencia a keystore; autenticação ficará fora do repositório.
- **GitHub Actions:** executar lint, tipos e testes. Build com tag usa credencial EAS fornecida como segredo no GitHub, nunca como arquivo versionado.
- **Maestro adiado:** os testes unitários e de componentes cobrem a primeira entrega; testes ponta a ponta acrescentam custo de execução e manutenção que não é necessário para iniciar o MVP.

## Referências consultadas

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
- [Reanimated SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/)
- [Expo Location SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [AsyncStorage SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/async-storage/)
- [Jest no Expo](https://docs.expo.dev/develop/unit-testing/)
- [ESLint e Prettier no Expo](https://docs.expo.dev/guides/using-eslint/)

Dependências de suporte remanescentes do template serão removidas se não forem utilizadas no app final; toda dependência direta mantida deverá ter motivo listado neste documento.

### Exceção temporária de lint no ambiente Windows

O preset Expo também habilita regras de resolução (`import/namespace`, `import/no-unresolved` e `import/no-duplicates`) que carregam `unrs-resolver`, uma extensão nativa. Neste ambiente Windows o binding não carrega porque falta `vcruntime140_1.dll`; os imports mobile continuam cobertos pelo TypeScript estrito e pelo bundler Metro. Para manter lint executável neste ambiente, somente essas regras de resolução estão desativadas. A exceção deve ser reavaliada caso o runtime C++ seja instalado ou o resolver passe a carregar; nenhuma regra de hooks, TypeScript, React ou Expo foi desativada.
