# Backend - Dia Leve

![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.0-0C4B33?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17-A30000?logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-9-0A9EDC?logo=pytest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

API REST do projeto **Dia Leve**, desenvolvida com Django + Django REST Framework, autenticacao JWT e persistencia em PostgreSQL.

## 1. Funcionalidades

- Cadastro de usuario.
- Login JWT (access e refresh token).
- Endpoint de usuario autenticado (`/api/auth/me/`).
- CRUD de tarefas.
- CRUD de categorias (isoladas por usuario).
- Compartilhamento de tarefas com outros usuarios (`shared_with`).
- Filtros por status, categoria e prioridade.
- Busca textual em titulo/descricao.
- Paginacao de resultados.
- Integracao externa com ViaCEP.

## 2. Stack

- Python 3.13
- Django 6.0.5
- Django REST Framework 3.17.1
- djangorestframework-simplejwt 5.5.1
- PostgreSQL 16
- Pytest + pytest-django
- Docker / Docker Compose

## 2.1 Arquitetura e decisoes de design

- API organizada em apps de dominio (`accounts` e `tasks`) para separar autenticacao e regra de negocio.
- Uso de DRF ViewSets para reduzir boilerplate de CRUD mantendo legibilidade.
- Validacoes de dominio em serializers (ex.: categoria deve pertencer ao usuario autenticado).
- Permissoes explicitas para compartilhamento:
  - dono pode editar/deletar/compartilhar,
  - usuario compartilhado possui apenas leitura.
- Integracao externa isolada em `tasks/integrations.py` para facilitar testes com mock e reduzir acoplamento.
- Praticas de qualidade adotadas: KISS, DRY e responsabilidade unica por modulo.

## 3. Estrutura de pastas

```text
backend/
  accounts/
    serializers.py
    urls.py
    views.py
  tasks/
    integrations.py
    models.py
    permissions.py
    serializers.py
    urls.py
    views.py
  core/
    settings.py
    urls.py
  tests/
    test_auth.py
    test_tasks.py
  manage.py
  requirements.txt
```

## 4. Configuracao de ambiente

Crie o arquivo `.env` a partir do template:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Exemplo base:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=todoapp
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
```

## 5. Subir com Docker Compose (recomendado)

Na raiz `todo-app`:

```bash
docker compose up --build db backend
```

Ou em background:

```bash
docker compose up -d --build db backend
```

API local:

- `http://localhost:8000/api/`

Admin:

- `http://localhost:8000/admin/`

## 6. Comandos uteis (raiz)

Migracoes:

```bash
docker compose exec backend python manage.py migrate
```

Criar superusuario:

```bash
docker compose exec backend python manage.py createsuperuser
```

Logs do backend:

```bash
docker compose logs -f backend
```

## 7. Execucao sem Docker (opcional)

Requer PostgreSQL local disponivel.

```powershell
cd .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Ajuste o `.env` para ambiente local:

```env
DB_HOST=localhost
DB_PORT=5432
```

Rode migracoes e servidor:

```bash
python manage.py migrate
python manage.py runserver
```

## 8. Dependencias principais

Do `requirements.txt`:

- Django==6.0.5
- djangorestframework==3.17.1
- djangorestframework_simplejwt==5.5.1
- psycopg2-binary==2.9.12
- pytest==9.0.3
- pytest-django==4.12.0
- requests==2.34.2

## 9. Endpoints

Base URL:

- `http://localhost:8000/api`

Header para rotas protegidas:

```text
Authorization: Bearer <access_token>
```

### Autenticacao

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`

### Tarefas e categorias

- `GET/POST /api/tasks/`
- `GET/PATCH/PUT/DELETE /api/tasks/{id}/`
- `POST /api/tasks/{id}/share/`
- `GET/POST /api/categories/`
- `GET/PATCH/PUT/DELETE /api/categories/{id}/`

### Integracao CEP

- `GET /api/address/{cep}/`

## 10. Modelos de dados

### Category

- `id`
- `name` (max 100)
- `owner` (usuario dono)
- `created_at`

### Task

- `id`
- `title` (max 255)
- `description` (opcional)
- `completed` (bool)
- `priority`: `low` | `medium` | `high`
- `due_date` (opcional)
- `category` (opcional)
- `owner`
- `shared_with` (lista de usuarios)
- `created_at`
- `updated_at`

## 11. Exemplos de payload

Registro:

```json
{
  "username": "joao",
  "email": "joao@email.com",
  "password": "senha123"
}
```

Login:

```json
{
  "username": "joao",
  "password": "senha123"
}
```

Categoria:

```json
{
  "name": "Trabalho"
}
```

Tarefa:

```json
{
  "title": "Finalizar relatorio",
  "description": "Entregar ate o fim do dia",
  "completed": false,
  "priority": "high",
  "due_date": "2026-05-30",
  "category": 1
}
```

Tarefa compartilhada:

```json
{
  "title": "Preparar apresentacao",
  "description": "Slides da reuniao semanal",
  "priority": "medium",
  "shared_with": [2, 3]
}
```

## 12. Filtros e busca

Endpoint: `GET /api/tasks/`

- `completed=true|false`
- `category=<id>`
- `priority=low|medium|high`
- `search=<termo>` (titulo e descricao)
- `page=<numero>`

Exemplo combinado:

`/api/tasks/?completed=false&priority=medium&search=reuniao&page=1`

## 13. Regras de autorizacao

- API usa JWT.
- Rotas de negocio exigem autenticacao.
- Tarefas:
  - dono pode visualizar, editar e remover.
  - usuario compartilhado pode apenas visualizar.
- Categorias:
  - sao isoladas por usuario.
  - tarefa so aceita categoria do proprio usuario autenticado.

## 14. Integracao ViaCEP

Implementacao em `tasks/integrations.py`.

Comportamento de `GET /api/address/{cep}/`:

- `200`: CEP valido.
- `404`: CEP inexistente/invalido (erro de dominio tratado).
- `502`: falha externa ao consultar ViaCEP.

## 15. Testes

Rodar via Docker:

```bash
docker compose run --rm backend pytest tests/ -v
```

Cobertura funcional da suite:

- autenticacao (registro/login/me),
- erros de credencial,
- CRUD de tarefas,
- CRUD de categorias,
- restricoes de permissao e compartilhamento,
- validacao de categoria entre usuarios,
- endpoint de CEP com sucesso e falha controlada.

## 16. CI

Pipeline em `.github/workflows/ci.yml`:

- sobe PostgreSQL em servico do GitHub Actions,
- instala dependencias do backend,
- roda migracoes,
- executa testes Pytest,
- realiza build da imagem Docker do backend.

## 17. Deploy/demo para avaliacao

Conforme alinhado por email com o recrutamento:

- nao ha ambiente corporativo disponibilizado para AWS/Azure,
- entregar aplicacao dockerizada com README detalhado e uma abordagem aceita,
- opcionalmente pode ser disponibilizada uma demo em ambiente gratuito.

Essa estrategia aumenta a reproducibilidade do projeto para avaliacao tecnica.

## 18. Autor

Desenvolvido por Lenon Merlo para teste tecnico.
