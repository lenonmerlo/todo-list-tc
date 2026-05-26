# Frontend - Dia Leve

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-E2E-C21325?logo=jest&logoColor=white)
![Selenium](https://img.shields.io/badge/Selenium-WebDriver-43B02A?logo=selenium&logoColor=white)

Aplicacao web do projeto **Dia Leve**. Esta SPA e responsavel pelo fluxo de autenticacao (login/cadastro) e pelo painel de tarefas com filtros, categorias, paginacao e operacoes de CRUD.

## Ambiente de producao

- Frontend (Vercel): https://todo-list-tc.vercel.app/
- Backend/API (Railway): https://todo-list-tc-production.up.railway.app/
- API base em producao: https://todo-list-tc-production.up.railway.app/api

## 1. Visao geral

Este frontend consome a API Django e entrega os fluxos:

- Cadastro e login com JWT.
- Exibicao de erros de API no formulario de autenticacao.
- Dashboard autenticado com:
  - listagem de tarefas,
  - criacao/atualizacao/remocao,
  - filtro por status,
  - busca textual,
  - filtro por categoria,
  - paginacao.
- Criacao de categorias no proprio painel.
- Sistema de temas com 3 opcoes (Kawaii, Classico e Energia), com troca em tempo real.

## 2. Tecnologias

- React 19
- Vite 8
- Axios
- ESLint
- Jest + Selenium WebDriver para E2E

## 2.1 Arquitetura e decisoes de design

- Estrutura por responsabilidade:
  - `services/` concentra chamadas HTTP e contratos com a API.
  - `hooks/` concentra estado assinado e regras de fluxo.
  - `pages/` compoe as telas de autenticacao e dashboard.
  - `components/` contem UI reutilizavel (ex.: clima, mini calendario).
- Theming orientado a tokens:
  - provider global para controle de tema,
  - variaveis CSS por tema para superfícies, tipografia, cores e contraste,
  - persistencia em `localStorage` para manter preferencia entre sessoes.
- Separacao de concerns para facilitar manutencao, testes e evolucao incremental.
- Estado de tarefas robusto em hook dedicado com controle de concorrencia (abort/cancelamento de requisicoes).
- Praticas adotadas: KISS, DRY e componentes pequenos com responsabilidade unica.

## 2.2 Temas (UX)

Temas disponiveis:

- Kawaii
- Classico
- Energia

Comportamento:

- seletor visivel na tela de autenticacao e no dashboard,
- aplicacao imediata do tema sem recarregar a pagina,
- preferencia salva no navegador e reaplicada automaticamente.

## 3. Estrutura principal

```text
frontend/
	src/
		components/
		contexts/
		hooks/
		pages/
		services/
	tests/
		e2e.test.js
	package.json
	Dockerfile
```

## 4. Requisitos

- Node.js 20+
- npm 10+
- Backend da aplicacao em execucao

Para E2E:

- Google Chrome instalado
- Backend e frontend ativos

## 5. Instalacao e execucao local

Na pasta `frontend`:

```bash
npm install
```

Rodar ambiente de desenvolvimento:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Visualizar build localmente:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## 6. Execucao com Docker Compose (pela raiz)

Com o projeto na raiz `todo-app`:

```bash
docker compose up --build frontend backend db
```

Frontend disponivel em:

- `http://localhost:5173`

## 7. Integracao com backend

O cliente HTTP usa `axios` com:

- `baseURL` dinamica por ambiente:
  - `VITE_API_BASE_URL` (quando definida)
  - producao: `https://todo-list-tc-production.up.railway.app/api`
  - desenvolvimento local: `http://localhost:8000/api`
- interceptor para enviar automaticamente `Authorization: Bearer <access_token>`

Arquivos relevantes:

- `src/services/api.js`
- `src/services/tasks.js`

## 8. Fluxo de autenticacao

- Modo login e cadastro no mesmo formulario.
- Em cadastro, o frontend chama `POST /api/auth/register/` e em seguida realiza login automatico.
- Em login, chama `POST /api/auth/login/`.
- Carrega usuario autenticado via `GET /api/auth/me/`.
- Tokens ficam em `localStorage` (`access_token` e `refresh_token`).

## 9. Fluxo de tarefas

No dashboard:

- Criar tarefa com titulo, descricao, prioridade e categoria opcional.
- Marcar/desmarcar como concluida.
- Excluir tarefa.
- Compartilhar tarefa por username e visualizar compartilhamentos persistentes no card.
- Filtrar por status e categoria.
- Buscar por texto.
- Navegar por paginas.
- Visualizar clima por CEP e mini calendario com destaque de dias com prazo (`due_date`).

## 10. Testes E2E

Comando:

```bash
npm run test:e2e
```

A suite `tests/e2e.test.js` cobre cenarios principais:

- carregamento da tela de autenticacao,
- cadastro,
- logout,
- login valido,
- login invalido exibindo erro,
- criacao de nova tarefa.

Observacoes:

- A configuracao atual usa o binario do Jest via `node ./node_modules/jest/bin/jest.js`, garantindo compatibilidade no Windows.
- Os testes isolam estado de sessao (evitando dependencia entre cenarios).

## 11. Solucao de problemas

Erro de CORS ou falha de conexao:

- confirme backend em `http://localhost:8000`.
- valide se o `docker compose` subiu `backend` e `db`.
- em producao, confirme `VITE_API_BASE_URL` no Vercel apontando para `https://todo-list-tc-production.up.railway.app/api`.

Tela sem dados apos login:

- verifique se o token foi salvo no `localStorage`.
- valide respostas da API em `/api/tasks/` e `/api/categories/`.

Falha em E2E:

- confirme Chrome instalado e versao compativel.
- garanta frontend e backend ativos antes de rodar `npm run test:e2e`.

## 12. Deploy/demo

Deploy ativo:

- Frontend em Vercel: https://todo-list-tc.vercel.app/
- Backend em Railway: https://todo-list-tc-production.up.railway.app/

Configuracao recomendada no Vercel:

- `VITE_API_BASE_URL=https://todo-list-tc-production.up.railway.app/api`
- `VITE_OPENWEATHER_API_KEY=<sua_chave_openweather>`

## 13. Autor

Desenvolvido por Lenon Merlo para teste tecnico.
