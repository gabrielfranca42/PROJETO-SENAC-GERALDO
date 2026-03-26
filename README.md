

---

# DOCUMENTAÇÃO TÉCNICA: SIGAC BACK-END (VERSÃO FINAL - FASE 1)

## 1. Status de Implementação (O que já foi feito)

A arquitetura do sistema foi estruturada para garantir segurança, escalabilidade e separação de responsabilidades (SRP). Abaixo estão os componentes técnicos finalizados:

### 1.1. Infraestrutura e Orquestração
* **Docker & Docker Compose:** Ambiente isolado com `Node.js 20-alpine` e `MongoDB 6.0`.
* **Separação de Contexto:** `server.js` atua estritamente como *entry point* (escuta de porta e conexão com DB), enquanto `app.js` orquestra middlewares globais (CORS, body-parser) e mapeamento de rotas.
* **Conexão Mongoose:** Módulo `src/config/connectDB.js` com tratamento de falhas e injeção via `.env`.

### 1.2. Modelagem de Dados (Camada de Dados)
* **User Model:** Schema com suporte a RBAC (`SUPER_ADMIN`, `COORDINATOR`, `STUDENT`), relacionamento de múltiplos cursos (Multitenancy) e *hash* automático de senhas via `bcryptjs` no evento `pre('save')`.
* **Activity Model:** Estrutura para submissão de horas, rastreio de texto extraído (`ocrText`) e status (`PENDING`, `APPROVED`, `REJECTED`).
* **Course & Category Model:** Subdocumentos para regras dinâmicas e limites de horas por área/categoria.
* **AuditLog Model:** Tabela imutável para rastreabilidade de ações críticas (Quem aprovou qual atividade, quando e por quê).

### 1.3. Segurança, Identidade e Autorização
* **UserController (Registro):** Endpoint para criação de identidades (`STUDENT`, `COORDINATOR`, `SUPER_ADMIN`). O controlador delega a criptografia para a camada de dados e previne e-mails duplicados.
* **AuthController (Login):** Endpoint de validação de credenciais que emite tokens JWT (RFC 7519). O token encapsula o `id`, a `role` e a lista de `courses` do usuário.
* **Middleware RBAC (`authRole.js`):** Interceptador HTTP que decodifica o token Bearer, valida permissões por array de *roles* e aplica regra de *Bypass* (Early Return) para o `SUPER_ADMIN`.

### 1.4. Serviços de Domínio (Business Logic)
* **FileProcessingService:** Motor híbrido que roteia *buffers* de memória baseados no MIME Type (utiliza `pdf-parse` para PDFs e `tesseract.js` para imagens).
* **EmailService:** Mensageria assíncrona (Event-Driven) via `nodemailer` para notificar coordenadores (novas submissões) e alunos (atualização de status).
* **ActivityService:** Validador matemático de limites de horas por categoria.

---

## 2. Configuração e Inicialização (NPM)

### 2.1. Dependências do Projeto
```bash
# Dependências Core
npm install express mongoose dotenv jsonwebtoken cors multer tesseract.js pdf-parse bcryptjs nodemailer

# Dependências de Desenvolvimento
npm install -D nodemon
```

### 2.2. Scripts do `package.json`
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

---

## 3. Arquitetura de Pastas
```text
backend/
├── src/
│   ├── config/      # [FEITO] Conexão DB e variáveis de ambiente (.env)
│   ├── controllers/ # [FEITO] Orquestração HTTP (Activity, Auth, Course, User)
│   ├── services/    # [FEITO] Regras de negócio (Activity, FileProcessing, Email)
│   ├── models/      # [FEITO] Schemas Mongoose (User, Activity, Course, AuditLog)
│   ├── middlewares/ # [FEITO] Auth RBAC (authRole.js)
│   ├── routes/      # [FEITO] Endpoints isolados (Auth, Users, Activities, Courses)
│   └── app.js       # [FEITO] Configuração Express e Middlewares Globais
├── server.js        # [FEITO] Entry point e Listener HTTP
└── Dockerfile       # [FEITO] Build de produção
```

---

## 4. Guia de Uso da API (Fluxo Operacional para Testes)

Para homologar a aplicação em ferramentas como Insomnia ou Postman, siga o fluxo de integração abaixo:

### Passo 1: Setup Inicial (Criar o Super Admin)
* **Rota:** `POST /api/v1/users/register`
* **Payload (JSON):**
  ```json
  {
    "name": "Administrador Geral",
    "email": "admin@senac.br",
    "password": "senhaSegura123",
    "role": "SUPER_ADMIN"
  }
  ```

### Passo 2: Autenticação (Gerar o JWT)
* **Rota:** `POST /api/v1/auth/login`
* **Payload (JSON):**
  ```json
  {
    "email": "admin@senac.br",
    "password": "senhaSegura123"
  }
  ```
* **Ação:** Copie a string devolvida no campo `token`.

### Passo 3: Consumir Rotas Protegidas (Ex: Criar um Curso)
* **Rota:** `POST /api/v1/courses`
* **Headers:** Adicionar chave `Authorization` com valor `Bearer SEU_TOKEN_AQUI`.
* **Payload (JSON):**
  ```json
  {
    "name": "Análise e Desenvolvimento de Sistemas",
    "totalHoursRequired": 120,
    "categories": [
      { "name": "Extensão", "maxHours": 40 },
      { "name": "Pesquisa", "maxHours": 40 }
    ]
  }
  ```

---

## 5. Definição de Variáveis de Ambiente (`.env`)

O backend exige os seguintes parâmetros para operar:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/sigac
JWT_SECRET=sua_chave_secreta_super_segura_aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_aplicativo
```

---

## 6. Resumo do Cumprimento de Requisitos do Documento (PI 3 2025.1)

1. **"O sistema deve contemplar autenticação e controle de perfis":** Resolvido via `AuthController` (JWT), `bcryptjs` e middleware `authRole.js`.
2. **"Uso opcional de OCR para leitura de certificados em imagem":** Resolvido via `FileProcessingService` com roteamento inteligente (`tesseract.js` para imagens e `pdf-parse` de alta performance para documentos nativos).
3. **"Associação de coordenadores e alunos a múltiplos cursos":** Resolvido na modelagem do Mongoose (array de `courses`) e validação estrita no `ActivityController.evaluateActivity` (Multitenancy).
4. **"Envio automático de notificações por e-mail":** Resolvido via `EmailService` integrado aos *Controllers* de submissão e avaliação.
5. **"Registro de logs de ações relevantes":** Resolvido através do `AuditLog Model`, garantindo rastreabilidade legal das aprovações/rejeições de horas complementares.

Compreendo a frustração gerada pela entrega fragmentada na iteração anterior. Confirmo o erro no processamento isolado das requisições e procedo com a correção obrigatória do escopo documental, unificando as URLs do Postman, as tabelas de especificação e a sinalização de pendências em um único artefato técnico.

Nenhuma alteração foi realizada em seu código-fonte. O que foi modificado foi exclusivamente o formato do "Tópico 7" da documentação, integrando as URLs absolutas de teste local (`http://localhost:3000`) para suprir a necessidade de homologação imediata da equipe de Front-end.

**Justificativa Técnica da Modificação:** A inclusão de URLs absolutas no formato `localhost` segue as diretrizes de documentação de APIs da OpenAPI Specification (OAS), garantindo que os clientes HTTP (Postman/Insomnia) não dependam de variáveis de ambiente não configuradas nos estágios iniciais de desenvolvimento. A sinalização visual de `[OK]` e `[FALTA]` atende aos princípios de Gestão de Configuração de Software (SCM), mapeando exatamente o que compila no repositório atual e o que ainda é um requisito aberto.

---

# ADENDO À DOCUMENTAÇÃO TÉCNICA: SIGAC BACK-END

## 7. Especificação da API RESTful e URLs Postman (Integração Front-end e Análise CRUD)

Esta seção mapeia os *endpoints* da aplicação, estruturados por domínio de negócio. Seguindo as diretrizes do estilo arquitetural REST e a semântica do protocolo HTTP (RFC 7231 e RFC 5789), as operações padrão de gerenciamento de ciclo de vida de um recurso (CRUD) estão mapeadas para métodos específicos.

**Atenção Front-end:** Todos os *endpoints* protegidos exigem o cabeçalho `Authorization: Bearer <JWT_TOKEN>`. As tabelas abaixo indicam explicitamente o que já está implementado e operacional (`[OK]`) e o que ainda **falta ser programado no código-fonte (`[FALTA]`)**. Para testar rotas com `/:id`, substitua esse trecho por um `ObjectId` válido do MongoDB (ex: `64a7b8f9e4b0a1c2d3e4f5g6`).

### 7.1. Domínio: Autenticação e Identidade (`/api/v1/auth` e `/api/v1/users`)

| Status Código | Operação CRUD | URL para Teste no Postman (Local) | Privilégio | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **[OK]** | *Custom* (POST) | `http://localhost:3000/api/v1/auth/login` | Público | Valida credenciais e emite token JWT. |
| **[OK]** | **Create** (POST) | `http://localhost:3000/api/v1/users/register` | `SUPER_ADMIN` | Cria nova identidade no sistema. |
| **[FALTA]** | **Read All** (GET) | `http://localhost:3000/api/v1/users` | `SUPER_ADMIN` | *Pendente:* Rota para retornar lista paginada de todos os usuários. |
| **[FALTA]** | **Read One** (GET) | `http://localhost:3000/api/v1/users/:id` | `SUPER_ADMIN` / Dono | *Pendente:* Rota para retornar metadados de um usuário específico. |
| **[FALTA]** | **Update** (PUT/PATCH) | `http://localhost:3000/api/v1/users/:id` | `SUPER_ADMIN` / Dono | *Pendente:* Rota para atualização de dados (ex: alteração de senha). |
| **[FALTA]** | **Delete** (DELETE) | `http://localhost:3000/api/v1/users/:id` | `SUPER_ADMIN` | *Pendente:* Rota para realizar *soft delete* de um usuário. |

### 7.2. Domínio: Cursos e Matrizes Curriculares (`/api/v1/courses`)

| Status Código | Operação CRUD | URL para Teste no Postman (Local) | Privilégio | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **[OK]** | **Create** (POST) | `http://localhost:3000/api/v1/courses` | `SUPER_ADMIN` | Cria nova matriz curricular e limites de horas. |
| **[FALTA]** | **Read All** (GET) | `http://localhost:3000/api/v1/courses` | Autenticado | *Pendente:* Rota para listar todos os cursos ativos (para dropdowns). |
| **[FALTA]** | **Read One** (GET) | `http://localhost:3000/api/v1/courses/:id` | Autenticado | *Pendente:* Rota para retornar detalhes estruturais de um curso. |
| **[FALTA]** | **Update** (PUT) | `http://localhost:3000/api/v1/courses/:id` | `SUPER_ADMIN` | *Pendente:* Rota para atualizar a matriz curricular (ex: `maxHours`). |
| **[FALTA]** | **Delete** (DELETE) | `http://localhost:3000/api/v1/courses/:id` | `SUPER_ADMIN` | *Pendente:* Rota para excluir um curso (Restrição de chave). |

### 7.3. Domínio: Atividades Complementares (`/api/v1/activities`)

| Status Código | Operação CRUD | URL para Teste no Postman (Local) | Privilégio | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **[OK]** | **Create** (POST) | `http://localhost:3000/api/v1/activities` | `STUDENT` | Submete certificado via form-data. Dispara OCR internamente. |
| **[OK]** | *Custom* (PUT) | `http://localhost:3000/api/v1/activities/:id/evaluate` | `COORDINATOR` | Atualiza status para APPROVED/REJECTED, gera AuditLog. |
| **[FALTA]** | **Read All** (GET) | `http://localhost:3000/api/v1/activities` | `STUDENT`/`COORD.` | *Pendente:* Rota para listar atividades baseada na role do usuário. |
| **[FALTA]** | **Read One** (GET) | `http://localhost:3000/api/v1/activities/:id` | Dono ou `COORD.` | *Pendente:* Rota para retornar detalhes e texto do OCR. |
| **[FALTA]** | **Delete** (DELETE) | `http://localhost:3000/api/v1/activities/:id` | `STUDENT` | *Pendente:* Rota para excluir submissão (se status for PENDING). |

---

### Próximo Passo Técnico

