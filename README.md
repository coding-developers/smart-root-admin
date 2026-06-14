# 🌱 Smart Root — Painel Admin

Painel administrativo do sistema de irrigação. Feito em **React + Vite**. O administrador
acompanha o dashboard, aprova/gerencia clientes, cadastra e associa placas (ESP32) e cuida
dos chamados de suporte. Acesso restrito a contas com papel **admin**.

---

## Pré-requisitos
- **Node.js 18+** (recomendado 20) e **npm** — verifique com `node -v` e `npm -v`.
- O **backend** (API FastAPI) rodando — por padrão em `http://127.0.0.1:8000`.

## Passo a passo — rodar localmente

### 1. Instalar as dependências
Na pasta do projeto:
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O painel sobe em **http://localhost:5174** (porta diferente do app cliente, para os dois
rodarem ao mesmo tempo). O terminal fica rodando o servidor; pare com `Ctrl+C`.

> **Como ele fala com o backend:** em desenvolvimento, as chamadas a `/api` são
> redirecionadas para `http://127.0.0.1:8000` pelo proxy do Vite (ver `vite.config.js`).
> Nada a configurar localmente além de ter o backend de pé.

### 3. Acessar
Abra **http://localhost:5174**. Faça login com uma conta **admin**. No ambiente local com o
seed padrão do backend, é `lisboa@bmo.dev.br` / `admin123` (troque a senha em produção).
Contas de cliente são recusadas neste painel.

---

## Build de produção
```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build localmente (porta 4173)
```

---

## Deploy (Vercel)
Pronto para a Vercel (`vercel.json` incluído). Ao importar o repositório:

1. **Framework:** Vite (detectado automaticamente). Build `npm run build`, saída `dist`.
2. **Variável de ambiente** (Settings → Environment Variables), marcada para **Production**:
   ```
   VITE_API_URL = https://URL_PUBLICA_DO_BACKEND
   ```
   Sem ela, o painel usa o fallback `/api`, que só funciona localmente.
3. **Importante:** a variável só vale para um **build novo** — após adicioná-la, faça um
   *Redeploy* (ou um novo push).

---

## Estrutura
```
src/
├── main.jsx              ponto de entrada
├── App.jsx               rotas (react-router)
├── api.js                camada de acesso ao backend (lê VITE_API_URL)
├── auth.jsx              contexto de autenticação (exige papel admin)
├── components/
│   ├── Layout.jsx        sidebar + navegação
│   └── Donut.jsx         gráfico de rosca (SVG puro)
└── pages/                Dashboard, Clients, Devices, Tickets
```
