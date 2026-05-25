# Backend - Todo List TC

## 1. Visão geral

Este diretório contém o backend da aplicação **Todo List TC**, desenvolvido com Django e Django REST Framework.

A API oferece:

- Cadastro de usuário.
- Autenticação com JWT.
- Endpoint para dados do usuário autenticado.
- CRUD de tarefas.
- CRUD de categorias.
- Compartilhamento de tarefas entre usuários.
- Filtros, busca e paginação.
- Integração externa com ViaCEP.

O frontend será documentado separadamente.

## 2. Tecnologias usadas

- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- Pytest
- Docker
- Docker Compose

## 3. Estrutura das pastas principais

- `accounts/`: registro, autenticação e endpoint de usuário autenticado.
- `tasks/`: regras de negócio de tarefas e categorias, permissões, serializers, integração ViaCEP.
- `core/`: configurações globais do Django (settings, URLs, WSGI/ASGI).
- `tests/`: suíte de testes automatizados do backend com Pytest.

## 4. Configuração do `.env` (usando `.env.example`)

A partir da raiz do projeto, crie o arquivo de ambiente do backend:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Depois, ajuste os valores conforme necessário no arquivo `backend/.env`.

Exemplo base (`backend/.env.example`):

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=todoapp
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=db
DB_PORT=5432
```

## 5. Subir banco e backend via Docker Compose (pela raiz)

Como o `docker-compose.yml` está na raiz do projeto, execute os comandos a partir dela:

```bash
docker compose up --build db backend
```

Ou, em background:

```bash
docker compose up -d --build db backend
```

Para acompanhar logs do backend:

```bash
docker compose logs -f backend
```

API disponível em:

- `http://localhost:8000/api/`

## 6. Rodar migrações

A partir da raiz do projeto:

```bash
docker compose exec backend python manage.py migrate
```

## 7. Criar superusuário (opcional)

A partir da raiz do projeto:

```bash
docker compose exec backend python manage.py createsuperuser
```

Painel admin:

- `http://localhost:8000/admin/`

## 8. Rodar testes com Pytest dentro do Docker

A partir da raiz do projeto:

```bash
docker compose run --rm backend pytest tests/ -v
```

Status atual da suíte do backend:

- Última validação local: 17 testes passando com `docker compose run --rm backend pytest tests/ -v`.

## 9. Rodar localmente fora do Docker

A execução local depende de um PostgreSQL disponível na máquina. A validação principal do projeto foi feita via Docker Compose.

Se preferir executar sem Docker:

1. Acesse a pasta do backend.

```powershell
cd .\backend
```

2. Crie/ative seu ambiente virtual.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Instale dependências.

```bash
pip install -r requirements.txt
```

4. Configure o arquivo `.env` com **DB_HOST=localhost** (fora do Docker não use `db`).

Exemplo:

```env
DB_HOST=localhost
DB_PORT=5432
```

5. Rode migrações e suba o servidor.

```bash
python manage.py migrate
python manage.py runserver
```

## 10. Endpoints da API

Base URL local:

- `http://localhost:8000/api`

Rotas protegidas exigem o header:

```text
Authorization: Bearer <access_token>
```

Autenticação:

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

## 11. Exemplos de payload JSON

### Registro (`POST /api/auth/register/`)

```json
{
  "username": "joao",
  "email": "joao@email.com",
  "password": "senha123"
}
```

### Login (`POST /api/auth/login/`)

```json
{
  "username": "joao",
  "password": "senha123"
}
```

### Categoria (`POST /api/categories/`)

```json
{
  "name": "Trabalho"
}
```

### Tarefa (`POST /api/tasks/`)

```json
{
  "title": "Finalizar relatório",
  "description": "Entregar até o fim do dia",
  "completed": false,
  "priority": "high",
  "due_date": "2026-05-30",
  "category": 1
}
```

### Tarefa compartilhada (`POST /api/tasks/`)

```json
{
  "title": "Preparar apresentação",
  "description": "Slides da reunião semanal",
  "priority": "medium",
  "shared_with": [2, 3]
}
```

## 12. Exemplos de filtros

Filtros disponíveis em `GET /api/tasks/`:

- `completed`:
  - `/api/tasks/?completed=true`
- `category`:
  - `/api/tasks/?category=1`
- `priority`:
  - `/api/tasks/?priority=high`
- `search` (busca em título e descrição):
  - `/api/tasks/?search=relatorio`
- `page` (paginação):
  - `/api/tasks/?page=2`

Também é possível combinar filtros:

- `/api/tasks/?completed=false&priority=medium&search=reuniao&page=1`

## 13. Regras de autorização e segurança

- A API usa JWT (Simple JWT) como autenticação.
- Endpoints de negócio exigem usuário autenticado.
- Tarefas:
  - Dono da tarefa pode visualizar, editar e deletar.
  - Usuários em `shared_with` podem apenas visualizar.
- Categorias:
  - São isoladas por usuário.
  - Uma tarefa só pode referenciar categoria do usuário autenticado.

## 14. Integração externa com ViaCEP

- Implementação em `tasks/integrations.py`.
- Endpoint da API: `GET /api/address/{cep}/`.
- Exemplo de chamada: `GET /api/address/01001000/`.
- Comportamento:
  - Retorna dados de endereço quando o CEP é válido.
  - Retorna 404 para CEP inexistente.
  - Retorna 502 em falhas externas na consulta.

## 15. Testes implementados

A suíte cobre os principais fluxos do backend, incluindo:

- Registro e login.
- Falha de login com senha inválida.
- CRUD de tarefas.
- Criação de categorias.
- Restrição de acesso sem autenticação.
- Regras de compartilhamento de tarefas.
- Restrição de categoria entre usuários.
- Endpoint de endereço (ViaCEP) com cenários de sucesso e CEP não encontrado.
- Serialização de detalhes de usuários compartilhados.

Observação:

- Os testes da integração externa usam **mock** para evitar dependência de internet.

## 16. Validação manual via Postman

Além dos testes automatizados, foi realizada validação manual com Postman para:

- Fluxo de autenticação JWT (register/login/me).
- Operações de tarefas e categorias.
- Aplicação das regras de autorização.
- Filtros e paginação.
- Consulta de CEP via endpoint de endereço.
