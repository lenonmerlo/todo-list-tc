# Dia Leve (Todo App)

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.0-0C4B33?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-E2E-C21325?logo=jest&logoColor=white)

Aplicacao full stack para gerenciamento de tarefas, com autenticacao JWT, categorias, filtros, compartilhamento de tarefas e interface web moderna para login/cadastro e dashboard.

## 1. Visao geral

O projeto esta dividido em:

- `backend/`: API REST com Django + DRF + PostgreSQL.
- `frontend/`: SPA em React + Vite consumindo a API.
- `docker-compose.yml`: orquestracao local de banco, backend e frontend.

## 2. Principais funcionalidades

- Cadastro de usuario.
- Login com JWT (access + refresh token).
- Endpoint de usuario autenticado (`/api/auth/me/`).
- CRUD de tarefas.
- CRUD de categorias por usuario.
- Compartilhamento de tarefas com outros usuarios.
- Filtros de tarefas (status, categoria, prioridade, busca, paginacao).
- Integracao com ViaCEP (`/api/address/{cep}/`).
- Interface frontend com fluxos de autenticacao e dashboard completos.

## 3. Arquitetura

```mermaid
flowchart LR
  U[Usuario no navegador] --> F[Frontend React - :5173]
  F -->|HTTP JSON| B[Backend Django REST - :8000]
  B -->|ORM| D[(PostgreSQL - :5432)]
  B -->|Consulta CEP| V[ViaCEP API]
```

## 4. Tecnologias

### Backend

- Python 3.13
- Django 6 + Django REST Framework
- Simple JWT
- PostgreSQL 16
- Pytest

### Frontend

- React 19
- Vite 8
- Axios
- Jest + Selenium WebDriver (E2E)

### Infra

- Docker
- Docker Compose
- GitHub Actions (pipeline de CI)

## 5. Requisitos

Para executar localmente com Docker:

- Docker Desktop ou engine Docker + Compose plugin

Para executar sem Docker:

- Python 3.13+
- Node.js 20+
- npm 10+
- PostgreSQL 16+

## 6. Subir o projeto com Docker (recomendado)

Na raiz `todo-app`:

```bash
docker compose up --build
```

Para executar em background:

```bash
docker compose up -d --build
```

Servicos esperados:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api/`
- Admin Django: `http://localhost:8000/admin/`
- PostgreSQL: `localhost:5432`

## 7. Configuracao de ambiente

### Backend

Crie o arquivo de ambiente a partir do template:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

O `docker-compose.yml` da raiz ja carrega esse arquivo no servico `backend`.

## 8. Comandos uteis (raiz)

Aplicar migracoes:

```bash
docker compose exec backend python manage.py migrate
```

Criar superusuario (opcional):

```bash
docker compose exec backend python manage.py createsuperuser
```

Ver logs do backend:

```bash
docker compose logs -f backend
```

Parar servicos:

```bash
docker compose down
```

## 9. Testes

### Backend (Pytest)

```bash
docker compose run --rm backend pytest tests/ -v
```

### Frontend E2E (Jest + Selenium)

Requisitos:

- Backend em execucao
- Frontend em execucao
- Google Chrome instalado

Comando:

```bash
cd frontend
npm run test:e2e
```

## 10. API (resumo)

Base URL local:

- `http://localhost:8000/api`

Autenticacao:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`

Recursos:

- `GET/POST /api/tasks/`
- `GET/PATCH/PUT/DELETE /api/tasks/{id}/`
- `GET/POST /api/categories/`
- `GET/PATCH/PUT/DELETE /api/categories/{id}/`
- `GET /api/address/{cep}/`

## 11. Deploy opcional e estrategia de entrega

Conforme alinhado com o recrutamento, nao foi disponibilizado ambiente proprio da empresa para deploy em AWS/Azure.

Dessa forma, a estrategia adotada e totalmente valida para avaliacao tecnica:

- Entrega da aplicacao dockerizada.
- Instrucoes completas de execucao no README.
- Opcionalmente, publicacao de demonstracao em ambiente gratuito de preferencia do candidato.

Isso garante reproducibilidade do ambiente e facilita a analise do time tecnico.

## 12. Estrutura de diretorios

```text
todo-app/
  docker-compose.yml
  backend/
    manage.py
    requirements.txt
    accounts/
    tasks/
    core/
    tests/
  frontend/
    package.json
    src/
    tests/
```

## 13. Documentacao especifica

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`

## 14. Autor

Desenvolvido por Lenon Merlo para teste tecnico.
