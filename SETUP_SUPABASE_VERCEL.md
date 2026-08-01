# Setup Supabase + Vercel

## 1) Criar projeto no Supabase
1. Crie um projeto no Supabase.
2. Vá em Project Settings > API.
3. Copie:
   - Project URL
   - anon public key

## 2) Configurar as variáveis de ambiente
Crie as variáveis no arquivo `.env` e também no painel da Vercel:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

O backend tambem aceita nomes alternativos de variaveis:
- URL: `NEXT_PUBLIC_SUPABASE_URL` ou `VITE_SUPABASE_URL`
- ANON KEY: `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `VITE_SUPABASE_ANON_KEY`
- SERVICE ROLE: `SUPABASE_SERVICE_KEY` ou `SUPABASE_SECRET_KEY`

> A `SUPABASE_SERVICE_ROLE_KEY` deve ficar apenas no backend (API da Vercel). Nunca use no navegador.

## 3) Como o frontend lê essas variáveis
O navegador não lê `.env` diretamente. O projeto usa a rota `/api/config`, que devolve os valores do ambiente da Vercel para o JavaScript da página.

Se quiser testar localmente sem a API, também pode preencher `supabase-config.js` com os mesmos dados.

## 4) Configurar autenticação no Supabase
1. Em Authentication > Providers, mantenha Email habilitado.
2. Em Authentication > URL Configuration, configure:
   - Site URL: URL do deploy na Vercel (ex.: https://seu-projeto.vercel.app)
   - Redirect URLs: inclua a URL do deploy e, se necessário, outras rotas.

## 5) Deploy na Vercel
1. Suba os arquivos para um repositório Git.
2. Importe o repositório na Vercel.
3. Faça o deploy.
4. Se trocar domínio/URL, atualize as URLs no Supabase.

## 6) Testar fluxos
1. Registro: digite e-mail e senha e clique em Registrar novo usuário.
2. Login: use o mesmo e-mail e senha e clique em Entrar.
3. Cadastro de atestado: após login, a página `/insereatestado.html` grava em Supabase pela API `/api/atestados`.
4. Consulta de atestados: use o botão Consultar Atestados para recarregar os dados salvos no banco.
5. Recuperação: informe e-mail e clique em Recuperar Senha.
6. Listagem de usuários (admin): abra `/usuarios.html` para ver a tabela de usuários via API `/api/users`.

## 7) Criar tabelas e políticas
Execute o arquivo `supabase-schema.sql` no SQL Editor do Supabase para criar:
- `public.user_profiles`
- `public.atestados`
- políticas RLS necessárias

## Observações de segurança
- A anon key pode ficar no frontend.
- Nunca use a service_role key no navegador.
- Senhas ficam no Auth do Supabase (não em texto puro no frontend).
