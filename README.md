# TATIM — Ordens de Serviço

Plataforma web simples para:

- **Dentistas** criarem ordens de serviço (`/novo-pedido`): dados do paciente, tipo de trabalho, dentes envolvidos (odontograma clicável), material, prazo, referência ao caso no DS Core, e fotos.
- **Você (laboratório)** acompanhar tudo num painel (`/dashboard`, protegido por senha): lista de casos, filtro por status, e uma tela de detalhe de cada pedido onde dá pra ver as fotos, conferir a referência do DS Core, mudar o status do caso e escrever notas internas.

Sobre o DS Core: não existe integração automática (a DS Core não oferece uma API pública), então o formulário tem um campo onde o dentista informa o nome do paciente / link do compartilhamento no DS Core, e você confere manualmente os arquivos `.ply` por lá — exatamente como já faz hoje.

## Como rodar no seu computador (opcional, pra testar antes de publicar)

Requer [Node.js](https://nodejs.org) instalado (versão 18 ou mais nova).

```
npm install
cp .env.example .env.local
# edite .env.local com os valores do Supabase (veja o passo 1 abaixo)
npm run dev
```

Depois abra http://localhost:3000

## Como publicar de verdade (grátis) — passo a passo

Você vai precisar de duas contas gratuitas: **Supabase** (banco de dados + armazenamento das fotos) e **Vercel** (hospedagem do site). As duas têm plano gratuito generoso, suficiente pra esse uso.

### 1. Criar o banco de dados (Supabase)

1. Crie uma conta em https://supabase.com (pode entrar com o Google).
2. Clique em "New project". Dê um nome (ex: `tatim-ordens`) e uma senha de banco (guarde ela, mas não é a mesma senha do painel).
3. Espere o projeto ser criado (leva ~2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase/schema.sql` (está na pasta deste projeto), copie todo o conteúdo, cole no editor e clique em **Run**. Isso cria as tabelas e o espaço de armazenamento das fotos.
6. Vá em **Project Settings** (ícone de engrenagem) → **API**. Você vai precisar de 3 valores nessa tela:
   - **Project URL** → é o `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → é o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (clique em "Reveal") → é o `SUPABASE_SERVICE_ROLE_KEY` — **essa é secreta, nunca compartilhe ou coloque no código**

### 2. Publicar o site (Vercel)

1. Crie uma conta em https://vercel.com (pode entrar com o GitHub, Google, etc).
2. A forma mais simples de subir o projeto sem usar linha de comando:
   - Crie uma conta no GitHub (https://github.com) se ainda não tiver.
   - Crie um repositório novo (pode ser privado) e suba os arquivos desta pasta nele (dá pra arrastar os arquivos direto pela interface do GitHub em "Add file → Upload files", exceto a pasta `node_modules` se ela existir).
   - Na Vercel, clique em "Add New… → Project", conecte sua conta do GitHub e selecione esse repositório.
3. Na tela de configuração do projeto na Vercel, abra **Environment Variables** e adicione as 4 variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` → escolha uma senha forte, só sua — é o que protege o `/dashboard`
4. Clique em **Deploy**. Em ~1 minuto o site estará no ar num link tipo `https://tatim-ordens.vercel.app`.

### 3. Usar

- Envie o link `https://SEU-SITE.vercel.app/novo-pedido` pros dentistas que enviam casos pra você — esse é o link do formulário.
- Acesse `https://SEU-SITE.vercel.app/dashboard` e entre com a senha que você definiu (`ADMIN_PASSWORD`) pra ver e controlar os casos.

### Atualizando o site depois

Qualquer alteração nos arquivos do projeto que você suba de novo pro GitHub é publicada automaticamente pela Vercel em menos de um minuto.

## Status de um caso

Cada pedido passa pelos seguintes status (você troca manualmente na tela de detalhe):

1. **Recebido** — acabou de chegar
2. **Em conferência de arquivos** — você está checando os arquivos no DS Core
3. **Arquivos confirmados** — os arquivos batem com o pedido
4. **Aceito** — caso aceito, pronto pra começar
5. **Em execução** — trabalho em andamento
6. **Concluído**
7. **Entregue**
8. **Cancelado**

## Segurança

O `/dashboard` é protegido por uma senha única (`ADMIN_PASSWORD`), guardada num cookie. É uma proteção simples — suficiente pra manter curiosos de fora, mas não é um sistema de login multiusuário. Se no futuro você quiser dar acesso a mais alguém do laboratório com login próprio, dá pra evoluir depois.

O formulário público (`/novo-pedido`) não exige login de propósito — qualquer dentista com o link consegue enviar um pedido, sem precisar criar conta.
