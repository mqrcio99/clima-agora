# Configurar o Supabase depois de criar o projeto

Este roteiro prepara o projeto Supabase sem ativar autenticação. O app permanece no modo local até a escolha e implementação de um método de login.

## 1. Configure as variáveis locais

No painel do Supabase, abra **Project Settings → API** e copie a **Project URL** e a chave pública **anon** ou **publishable**. Nunca use `service_role` no navegador.

Se `.env.local` ainda não existir, crie-o a partir do exemplo:

```bash
cp .env.example .env.local
```

Se já existir, não o sobrescreva. Preencha ou atualize somente estas variáveis:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave-publica>
```

O arquivo `.env.local` é ignorado pelo Git. Não envie seus valores pelo chat, não os coloque em commits e não adicione uma chave `service_role` a nenhuma variável `VITE_*`.

## 2. Crie as tabelas e habilite RLS

No painel do Supabase, abra **SQL Editor → New query**. Copie e execute uma única vez o conteúdo de [`supabase/migrations/20261102000000_create_user_tables.sql`](../supabase/migrations/20261102000000_create_user_tables.sql).

A migration cria `profiles`, `favorites` e `preferences`, ativa Row Level Security (RLS) e limita as políticas ao usuário autenticado. Em **Table Editor**, confirme que as três tabelas existem e que o RLS aparece habilitado.

Se a execução falhar, não repita a migration às cegas: verifique se alguma tabela ou política já existe antes de corrigir o estado do projeto.

## 3. Mantenha autenticação e sincronização adiadas

Não habilite Google OAuth nesta etapa. A tela Conta oferece apenas **Continuar sem login**, e os fluxos de autenticação e sincronização remota estão adiados até a definição de outro método.

As tabelas desta migration têm políticas RLS baseadas em `auth.uid()`. Sem uma sessão autenticada, o app não pode gravar dados privados nelas. Não remova nem enfraqueça essas políticas para permitir acesso anônimo.

## 4. Inicie e verifique localmente

Depois de salvar `.env.local`, reinicie o servidor Vite:

```bash
npm run dev
```

Abra `http://localhost:5173/conta` e valide:

- A tela informa que o app está no modo local.
- **Continuar sem login** leva à tela Clima.
- Busca, favoritos e configurações locais continuam disponíveis sem sessão.

Também rode as verificações locais:

```bash
npm test
npm run lint
npm run build
npx playwright test e2e/routes.spec.js
```

## 5. Adie as variáveis de deploy

Não é necessário cadastrar as variáveis Supabase na Vercel enquanto nenhuma tela usa o banco. Quando um método de autenticação e a sincronização forem implementados, cadastre somente a URL e a chave pública nos ambientes necessários; nunca use `service_role` no cliente.

## Estado da integração no app

- O cliente Supabase está preparado, mas não é usado pelas telas no modo atual.
- A migration e as políticas RLS estão versionadas no repositório.
- O app já oferece **Continuar sem login** na tela Conta.
- A sincronização de favoritos existe parcialmente em `src/services/supabaseSync.js`, mas ainda não está ligada ao fluxo das telas nem à confirmação de importação local descrita no plano.
- As configurações da tela Configurações continuam locais; o formato remoto atual não cobre todas as preferências disponíveis.

Portanto, concluir este roteiro prepara o projeto e valida o modo local, mas não conecta dados remotos. A autenticação, a sincronização e os testes de isolamento por usuário ficam para uma etapa posterior, depois da escolha explícita do provedor.