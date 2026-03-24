

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
