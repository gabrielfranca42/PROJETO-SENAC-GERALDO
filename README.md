# SIGAC — Backend API

API REST do Sistema Integrado de Gestão de Atividades Complementares (SIGAC).

## Tecnologias

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Banco de Dados:** MongoDB (Mongoose ODM)
- **Autenticação:** JWT (JSON Web Token)
- **Upload:** Multer
- **OCR:** Tesseract.js
- **E-mail:** Nodemailer

## Pré-requisitos

- Node.js 18+
- MongoDB rodando localmente ou via Docker

## Instalação

```bash
cd backend
npm install
```

## Executar com Docker (MongoDB)

```bash
# Na raiz do projeto (onde está docker-compose.yml)
docker-compose up -d mongodb
```

## Iniciar o Servidor

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

O servidor roda em `http://localhost:3000`

## Variáveis de Ambiente

| Variável | Descrição | Padrão Dev |
|---|---|---|
| `MONGO_URI` | URI de conexão MongoDB | `mongodb://root:rootpassword@127.0.0.1:27017/pi_db?authSource=admin` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | `sigac-dev-secret-key-2026` |
| `PORT` | Porta do servidor | `3000` |

## Endpoints da API

### Autenticação (`/api/v1/auth`)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/auth/login` | Login (retorna JWT) | Pública |

### Usuários (`/api/v1/users`)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/users/register` | Cadastrar usuário | Pública |
| GET | `/users/me` | Perfil do usuário logado | JWT |
| GET | `/users` | Listar usuários (filtro: `?role=COORDINATOR`) | JWT + ADMIN |
| GET | `/users/:id` | Buscar por ID | JWT + ADMIN |
| PUT | `/users/:id` | Atualizar usuário | JWT + ADMIN |
| DELETE | `/users/:id` | Remover usuário | JWT + SUPER_ADMIN |

### Cursos (`/api/v1/courses`)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/courses` | Criar curso | JWT + ADMIN |
| GET | `/courses` | Listar cursos | JWT |
| GET | `/courses/:id` | Buscar curso por ID | JWT |
| PUT | `/courses/:id` | Atualizar curso | JWT + ADMIN |
| PATCH | `/courses/:id` | Atualização parcial | JWT + ADMIN |
| DELETE | `/courses/:id` | Excluir curso | JWT + SUPER_ADMIN |
| POST | `/courses/:id/categories` | Adicionar regra/categoria | JWT + ADMIN |
| DELETE | `/courses/:id/categories/:catId` | Remover regra/categoria | JWT + ADMIN |

### Atividades (`/api/v1/activities`)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/activities` | Submeter atividade | JWT + STUDENT |
| GET | `/activities` | Listar atividades (filtro: `?status=PENDING`) | JWT |
| GET | `/activities/:id` | Detalhes da atividade | JWT |
| PUT | `/activities/:id` | Atualizar atividade | JWT + STUDENT |
| DELETE | `/activities/:id` | Excluir atividade | JWT + STUDENT |
| PUT | `/activities/:id/evaluate` | Avaliar atividade | JWT + COORDINATOR |

## Roles do Sistema

| Role | Permissões |
|---|---|
| `SUPER_ADMIN` | Acesso total — bypass de RBAC |
| `ADMIN` | CRUD de cursos, coordenadores e usuários |
| `COORDINATOR` | Avaliar atividades, gerenciar alunos do curso |
| `STUDENT` | Submeter e gerenciar próprias atividades |

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Conexão MongoDB
│   ├── controllers/
│   │   ├── AuthController.js   # Login/JWT
│   │   ├── UserController.js   # CRUD de usuários
│   │   ├── CourseController.js # CRUD de cursos + categorias
│   │   └── ActivityController.js # Atividades complementares
│   ├── middlewares/
│   │   ├── auth.js             # Validação JWT
│   │   └── authRole.js         # Autorização por role (RBAC)
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Activity.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── courseRoutes.js
│   │   └── activityRoutes.js
│   ├── services/
│   │   ├── activityService.js
│   │   ├── DashboardService.js
│   │   ├── EmailService.js
│   │   ├── FileProcessingService.js
│   │   └── orcService.js
│   ├── app.js                  # Configuração Express
│   └── server.js               # Ponto de entrada
├── Dockerfile
└── package.json
```

## Frontend

O frontend React está em um repositório separado: [FRONTEND-REACT-PI](https://github.com/gabrielfranca42/FRONTEND-REACT-PI)

O frontend se conecta a esta API via `http://localhost:3000/api/v1`.