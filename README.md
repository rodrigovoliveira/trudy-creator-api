# trudy-creator-api

API em [Next.js](https://nextjs.org) na [Vercel](https://vercel.com) que expõe `GET /api/creator` e faz proxy para o endpoint Trudy (`shopkeeper.trudy.app`), agregando o stream **SSE** em JSON.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `TRUDY_BRAND_ID` | ID da marca no Trudy (ex.: `brnd_...`) |
| `TRUDY_TOKEN` | JWT de sessão (Clerk) usado na query string, o mesmo contexto da [extensão Trudy](https://chromewebstore.google.com/detail/behdpdkolbjbhmjdacocnlangeaopgih) |

1. Copie `.env.example` para `.env.local`.
2. Preencha os valores (não commite `.env.local`).
3. No deploy na Vercel: **Settings → Environment Variables** — adicione as mesmas chaves para Production (e Preview, se quiser testar PRs).

Se um JWT tiver sido exposto em repositório ou chat, **renove** a sessão no Trudy e atualize `TRUDY_TOKEN`.

## Renovação do token

O token expira (campo `exp` no JWT). Opções para uso solo:

- **Manual:** faça login na extensão Trudy, capture o token atualizado (rede/DevTools) e atualize `.env.local` ou as variáveis na Vercel.
- **Endpoint próprio (opcional):** um `POST` protegido por secret forte só seu pode receber o token da extensão e você atualiza o segredo na Vercel via CLI ou painel — não exponha esse endpoint sem autenticação.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Teste a API:

```http
GET http://localhost:3000/api/creator?username=USUARIO_INSTAGRAM
```

## Validar o fluxo Trudy (Node + fetch + SSE)

Com `.env.local` preenchido:

```bash
npm run validate:trudy
```

Outro Instagram (argumento; no macOS **não** use `USERNAME=...` — essa variável é do sistema):

```bash
node --env-file=.env.local scripts/validate-trudy.mjs outro_user
```

Ou: `TRUDY_TEST_USERNAME=outro_user npm run validate:trudy`

## Build

```bash
npm run build
npm start
```

## Repositório no GitHub (novo projeto)

Na pasta do projeto:

```bash
cd trudy-creator-api
git init
git add .
git status   # confira: .env não deve aparecer; .env.example sim
git commit -m "feat: API proxy Trudy + Next.js"
git branch -M main
```

No GitHub: **New repository** → nome (ex.: `trudy-creator-api`) → **sem** README/license (repositório vazio). Depois:

```bash
git remote add origin https://github.com/SEU_USUARIO/trudy-creator-api.git
git push -u origin main
```

(Substitua `SEU_USUARIO` e o nome do repositório. SSH: `git@github.com:SEU_USUARIO/trudy-creator-api.git`.)

## Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar “Continue with GitHub”).
2. **Add New… → Project** → **Import** o repositório `trudy-creator-api`.
3. Framework: Next.js (detectado automaticamente). **Deploy** (o primeiro build pode falhar sem as env vars — é normal).
4. No projeto: **Settings → Environment Variables** → adicione `TRUDY_BRAND_ID` e `TRUDY_TOKEN` para **Production** (e **Preview** se quiser testar PRs). Salve.
5. **Deployments** → nos três pontos do último deploy → **Redeploy** (para aplicar as variáveis).

Produção: [https://trudy-creator-api.vercel.app](https://trudy-creator-api.vercel.app/) (página inicial = template Next.js; a API fica em `/api/creator`).

Teste em produção:

```http
GET https://trudy-creator-api.vercel.app/api/creator?username=USUARIO_INSTAGRAM
```

### CLI (opcional)

```bash
vercel login
cd trudy-creator-api
vercel link    # associa a pasta ao projeto na Vercel
vercel env pull .env.local   # opcional: baixa envs para local
vercel --prod
```

Defina as mesmas variáveis no dashboard ou com `vercel env add`.

A rota usa `maxDuration` de 60s; em planos Hobby o limite padrão de funções pode ser menor — se o build ou a rota falharem por timeout, veja [limites](https://vercel.com/docs/functions/runtimes#max-duration) e o plano da conta.

## (Opcional) Cache

Para reduzir chamadas repetidas ao mesmo `username`, o plano sugeriu cache curto com [Vercel KV](https://vercel.com/docs/storage) ou Edge Config — não está implementado neste repositório.
