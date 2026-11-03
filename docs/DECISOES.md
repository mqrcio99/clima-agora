# Decisões técnicas

## Rotas da aplicação

Data: 2026-11-03

- A aplicação usa React Router para rotas de cliente e mantém a previsão atual em `/`.
- `/favoritos`, `/conta` e `/configuracoes` são destinos independentes; as seções “Agora” e “16 dias” continuam sendo âncoras da página principal.
- A tela de configurações é apenas uma estrutura inicial. Os controles serão definidos após a aprovação do plano de implementação dos ajustes.
- A tela de conta mantém o login social opcional e não exige Supabase para navegar ou usar a previsão.

### Dependência

- `react-router-dom` (e o pacote transitivo `react-router`): adotados para usar roteamento padrão de React, suportar navegação por histórico e URLs diretas e evitar implementar manualmente a History API.
- Licença declarada: MIT para ambos.
- `npm audit` após a instalação: 8 vulnerabilidades na árvore total (7 moderadas e 1 alta), reportadas em dependências já presentes no conjunto de lint e na dependência transitiva `zod`. Nenhuma correção forçada foi aplicada. O resultado deve ser reavaliado em uma etapa própria de atualização de dependências.
