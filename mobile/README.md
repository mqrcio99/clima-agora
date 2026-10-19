# Clima Agora Mobile

Aplicativo Android em React Native e Expo, com previsão da Open-Meteo, localização do dispositivo, busca por cidade, cache offline e temas que acompanham o clima.

## Funcionalidades

- Clima atual, alertas e previsão para cinco dias.
- Faixa horária horizontal com encaixe, resumo de chuva/temperatura e detalhes ao tocar em um horário.
- Localização em primeiro plano e busca manual como alternativa.
- Cache da última previsão para consulta offline.
- Sete temas: céu limpo, chuva, frio, neve, nublado, noite e tempestade.
- Fundo animado com redução de movimento e pausa em segundo plano.
- Playground de condições disponível somente em desenvolvimento.

## Capturas

O app dispõe de sete temas para inspecionar no playground durante o desenvolvimento: `clear`, `rain`, `cold`, `snow`, `cloudy`, `night` e `storm`. As capturas da interface final e da faixa horária serão adicionadas após validar a experiência em um aparelho Android; a prévia web não substitui capturas de um dispositivo real.

## Requisitos e execução

Instale uma versão LTS do Node.js compatível com o Expo, depois execute:

```sh
cd mobile
npm ci
npx expo start
```

Abra o QR code com Expo Go quando a versão instalada for compatível com este SDK. Também é possível iniciar um emulador Android configurado pelo Android Studio com `npm run android`. O build de distribuição do APK é remoto e não depende do Android Studio.

Qualidade local:

```sh
npm run check
npx expo install --check
npx expo-doctor
```

`npm run check` executa ESLint, TypeScript, Jest e verificação de formatação.

## APK e distribuição

Após concluir a configuração EAS e adicionar `EXPO_TOKEN` aos segredos do GitHub, o workflow produz o APK de demonstração com o perfil `preview` e o disponibiliza como anexo de um GitHub Release disparado por uma tag `v*`. As notas da release incluem a página do build EAS e o link direto do artefato.

Ainda faltam a identidade final do app, `eas.json` e o vínculo do projeto com uma conta Expo. Antes de usar o workflow, conclua essa configuração e prepare as credenciais do primeiro build. Configure um segredo de repositório chamado `EXPO_TOKEN` com um token de acesso pessoal Expo. Não armazene esse token, keystore ou credenciais no repositório; as credenciais de assinatura devem ser gerenciadas pelo EAS.

Depois de mesclar o workflow na branch padrão, crie e envie uma tag de versão para iniciar a automação:

```sh
git tag v1.0.0
git push origin v1.0.0
```

Build manual:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

O APK final ainda não foi gerado. Portanto, tamanho do arquivo, versão mínima do Android e instruções específicas de instalação serão documentados após o primeiro build concluído. Este APK é uma demonstração; publicação na Play Store requer um AAB e conta de desenvolvedor, fora do escopo atual.

## Estrutura

```text
src/
  app/            # rota principal Expo Router
  components/     # busca, cartão, faixas horária/diária e fundo
  hooks/          # fluxo de localização, consulta e cache
  playground/     # cenários mockados de desenvolvimento
  services/       # Open-Meteo e geocodificação
  styles/         # tokens e sete temas
  types/          # modelos meteorológicos
  utils/          # condições, alertas, cache e previsão horária
```

## Decisões e próximos passos

As justificativas para dependências, arquitetura e trade-offs estão em [`docs/DECISOES.md`](../docs/DECISOES.md); o plano aprovado está em [`docs/PLANO-MOBILE.md`](../docs/PLANO-MOBILE.md).

Próximos passos: configurar a identidade definitiva e os perfis EAS, executar `expo-doctor`, criar o primeiro APK e validar instalação, acessibilidade e desempenho em dispositivos Android reais. Widgets, notificações de chuva, internacionalização e testes ponta a ponta com Maestro permanecem fora do MVP.
