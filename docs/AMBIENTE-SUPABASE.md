# Ambiente local do Supabase

## Objetivo

Preparar o projeto para receber o banco de dados do Supabase sem expor credenciais no repositório.

## Arquivos relevantes

- `.env.local`: arquivo local com os valores reais do ambiente
- `.env.example`: modelo de referência sem valores reais
- `src/services/supabase.js`: cliente cliente que inicializa somente quando as variáveis existem

## O que está pronto

- o app continua funcionando sem o Supabase configurado
- o cliente do banco não quebra a aplicação quando as variáveis faltam
- o ambiente está preparado para receber `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## O que falta para você validar amanhã

1. abrir o painel do Supabase
2. confirmar o projeto que vai receber o banco
3. copiar a URL do projeto para `VITE_SUPABASE_URL`
4. copiar a chave pública do cliente para `VITE_SUPABASE_ANON_KEY`
5. habilitar o provedor de autenticação social
6. configurar `Site URL` e `Redirect URLs` para `http://localhost:5173`
7. aplicar a migration SQL e verificar o RLS

## Regras de segurança

- nunca compartilhar Client Secret, token, URL com senha ou service role no chat
- manter `.env.local` fora do Git
- não commitar valores reais
- usar placeholders em documentação e exemplos
