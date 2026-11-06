# Plano do Supabase para o Clima Agora

## Decisões aprovadas

1. Objetivo do banco: sincronizar favoritos e preferências entre dispositivos, com login obrigatório para o fluxo sincronizado.
2. Autenticação: adiada. Google OAuth está fora do escopo atual; o método futuro precisa ser escolhido antes de ativar sincronização. O fluxo visitante sem login continua funcionando.
3. Dados no banco: favoritos, e eventualmente preferências do usuário (tema, unidade etc.). A última cidade pesquisada continuará no localStorage.
4. Linguagem: manter JavaScript para o app atual; não migrar para TypeScript neste momento.
5. Migrations: SQL versionado aplicado no painel do Supabase.
6. Ambientes: um único projeto no sandbox por enquanto, seguindo o modelo simples e seguro do MVP.
7. Plano gratuito: aceitar a pausa por inatividade e documentar a condição, sem criar dependência de rotina gradativa no momento.
8. Varredura de segredos: gitleaks em hook local + CI.
9. Importação de dados: ao fazer login, o app pergunta antes de importar favoritos do localStorage para o banco.
10. Escopo: manter a consulta simples atual (geolocalização e busca por cidade) como fluxo principal; depois adicionar autenticação/complementos opcionais (login, favoritos e sincronização) como evolução do app.

## Principio de arquitetura

O app deve continuar funcionando sem Supabase:

- a geolocalização e a busca por cidade continuam como hoje
- o `localStorage` segue sendo a persistência principal do usuário anônimo
- o Supabase entra como camada opcional de sincronização e preferências do usuário autenticado

Em outras palavras, a arquitetura da aplicação deve ser local-first e login-optional.

## Mapa dos arquivos

- `src/utils/storage.js`: camada de persistência local
- `src/hooks/useWeather.js`: busca por localização/cidade e estado do carregamento
- `src/services/` : integrações externas e abstrações de dados
- `src/app/` e componentes UI: sem lógica de banco
- `supabase/migrations/`: schema SQL aprovado
- `.env.example`: somente nomes de variáveis, sem segredos
- `.env.local`: usado localmente, ignorado pelo Git

## Modelo de dados proposto

### Tabela `profiles`

Objetivo: vincular o usuário autenticado ao app e guardar dados mínimos de perfil.

Campos previstos:
- `id` UUID PRIMARY KEY REFERENCES `auth.users(id)` ON DELETE CASCADE
- `display_name` TEXT NULL CHECK (char_length(display_name) <= 80)
- `avatar_url` TEXT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

RLS: cada usuário lê e altera apenas o próprio registro.

### Tabela `favorites`

Objetivo: guardar cidades favoritas sincronizadas entre dispositivos.

Campos previstos:
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES `auth.users(id)` ON DELETE CASCADE
- `city_name` TEXT NOT NULL CHECK (char_length(city_name) BETWEEN 2 AND 120)
- `latitude` DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90)
- `longitude` DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180)
- `display_name` TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 120)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

Restrições:
- UNIQUE `(user_id, city_name)`
- UNIQUE `(user_id, latitude, longitude)` ou uma variante de arredondamento conforme a política de minimização

Observação de privacidade:
- a lat/long deve ser arredondada para 2 casas decimais antes de persistir, conforme regra do projeto
- nunca armazenar IP, dados pessoais ou logs de geolocalização exata

### Tabela `preferences`

Objetivo: manter configurações do usuário autenticado.

Campos previstos:
- `user_id` UUID PRIMARY KEY REFERENCES `auth.users(id)` ON DELETE CASCADE
- `unit_system` TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial'))
- `theme_preference` TEXT NOT NULL DEFAULT 'auto' CHECK (theme_preference IN ('auto', 'light', 'dark'))
- `default_city` TEXT NULL CHECK (char_length(default_city) BETWEEN 2 AND 120)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

## Regras de segurança e RLS

A política mínima e correta será:

- `profiles`: o usuário atual só pode ler e alterar a linha cujo `id = auth.uid()`
- `favorites`: o usuário atual só pode inserir, ler, alterar e apagar linhas cujo `user_id = auth.uid()`
- `preferences`: o mesmo padrão, com `user_id = auth.uid()`

Todas as tabelas devem ser criadas com `ENABLE ROW LEVEL SECURITY` no mesmo arquivo de migration.

Exemplo de política conceitual:

```sql
CREATE POLICY "Usuário pode ver apenas seu perfil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuário pode inserir seu favorito"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar somente seus favoritos"
ON public.favorites
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Fluxo funcional proposto

### Fluxo atual (sem login)

1. app abre
2. tenta geolocalização do navegador
3. se não houver permissão, busca por cidade digitada
4. salva última cidade em `localStorage`
5. mostra previsão

### Fluxo autenticado futuro (adiado)

1. escolher e implementar um método de autenticação
2. app valida sessão do Supabase
3. se aprovado, oferece importação dos favoritos do `localStorage`
4. app sincroniza favoritos e preferências com o banco
5. mantém fallback local se a rede falhar ou se o usuário estiver sem sessão

## Estratégia local-first

A camada de persistência deve seguir este padrão:

- `localStorage` responde imediatamente
- Supabase é opcional e síncrono em segundo plano
- erros de rede não quebram a tela atual
- login/logout não removem a última experiência do usuário anônimo

### Recomendação de compatibilidade

O app atual deve manter:
- busca por localização
- busca por cidade digitada
- estado de erro discreto
- leitura das preferências sem exigir Supabase

A autenticação deve ser adicionada como camada extra e não como requisito de funcionamento normal.

## Paradas manuais

### PARADA MANUAL #1 – GitHub / repositório
1. Confirmar que o repositório é privado.
2. Abrir Settings → Advanced Security / Code security.
3. Verificar se secret scanning e push protection estão disponíveis para o plano.
4. Ativar proteção da branch `main` com pull request.

Por que é necessário: o projeto deve ser seguro por padrão antes de qualquer integração externa.
O que devolver: somente "disponível" ou "exige licença".
Como verificar depois: checar as configurações do GitHub e a branch protegida.

### PARADA MANUAL #2 – Supabase
1. Acessar o painel do projeto Supabase.
2. Copiar a URL do projeto e a chave pública do cliente.
3. Preencher `.env.local` com nomes de variáveis e valores do painel.

Por que é necessário: o app precisa do cliente do Supabase em tempo de execução sem expor a chave secreta.
O que devolver: somente o nome da chave visível no painel, não o valor completo.
Como verificar depois: o app inicia sem quebrar quando a variável pública está presente.

### PARADA MANUAL #3 – Auth
1. Acessar Authentication do Supabase.
2. Ativar o provedor social escolhido.
3. Configurar `Site URL` e `Redirect URLs` para `http://localhost:5173` e, depois, o domínio da Vercel.

Por que é necessário: o login social precisa de redirecionamento válido e sem configuração quebrada.
O que devolver: confirmação de que a autenticação está ativa e os URLs foram cadastrados.
Como verificar depois: abrir o fluxo de login e confirmar que o redirect funciona localmente.

### PARADA MANUAL #4 – Migration SQL
1. Criar as migrations em `supabase/migrations/`.
2. Aplicar os arquivos no editor SQL do painel ou pela CLI, conforme a decisão do cliente.
3. Confirmar que todas as tabelas exibem RLS ativo.

Por que é necessário: o banco precisa estar protegido desde o início.
O que devolver: "executou sem erro" ou a mensagem de erro sem revelar credenciais.
Como verificar depois: listar as tabelas e conferir o estado do RLS no painel.

### PARADA MANUAL #5 – Usuários de teste
1. Criar dois usuários de teste no painel do Supabase.
2. Guardar as credenciais apenas em `.env.test.local` e ignorar esse arquivo via Git.
3. Validar o comportamento RLS com um usuário e outro.

Por que é necessário: a prova real de RLS só funciona com usuários reais e dados isolados.
O que devolver: confirmação de que ambos os usuários estão disponíveis.
Como verificar depois: rodar o script de verificação de RLS localmente sem usar chave secreta.

### PARADA MANUAL #6 – Vercel e Supabase
1. Cadastrar variáveis no Vercel por ambiente.
2. Usuários de produção e preview devem ter ambientes distintos.
3. Adicionar o domínio da Vercel às URLs de redirecionamento do Auth.

Por que é necessário: evitar vazamento entre preview e produção.
O que devolver: confirmação de que os ambientes foram mapeados.
Como verificar depois: build e deploy preview sem expor segredos em logs.

## Critério de pronto

A implementação do Supabase só pode seguir se estes itens estiverem cumpridos:

- .gitignore ajustado corretamente
- `.env.example` com apenas nomes de variáveis
- nenhuma chave secreta no repositório
- RLS ativo em todas as tabelas
- autenticação configurada e validada no painel
- fluxo sem login funcionando sem regressão
- fluxo autenticado funcionando com importação opcional do localStorage
- testes locais de RLS e persistência executando sem segredos

## Riscos e contingências

- se o projeto ficar com autenticação social logo no início, o tempo de entrega aumenta e o risco de integração é maior
- se o plano gratuito pausar, o app continua funcionando em modo local-only, mas a sincronização fica indisponível
- o login social exige gerenciar URLs de redirecionamento e política de domínio corretamente
- o uso de `localStorage` como fallback cuidadoso é essencial para evitar regressões na UX atual

## Próximo passo

O plano está autorizado para preparação do projeto. Siga [`docs/AMBIENTE-SUPABASE.md`](./AMBIENTE-SUPABASE.md) para aplicar a migration e validar RLS, mantendo autenticação e variáveis de deploy adiadas enquanto o provedor não for escolhido.

Antes de habilitar sincronização real, confirme no painel que as tabelas existem e que o RLS está ativo. Depois da escolha de autenticação, conecte o ciclo de sessão à importação opcional dos favoritos locais e implemente a persistência remota das preferências, mantendo o app funcional sem sessão.
