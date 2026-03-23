Conforme solicitado, a documentação foi atualizada para incluir a seção de **Status de Implementação**, detalhando os componentes técnicos que já foram codificados e estão operacionais conforme os arquivos fornecidos.

---

# DOCUMENTAÇÃO TÉCNICA: SIGAC BACK-END (ATUALIZADA)

## 1. Status de Implementação (O que já foi feito)

Abaixo estão os componentes técnicos já estruturados e fundamentados na lógica de persistência e segurança:

### 1.1. Infraestrutura e Containerização
* **Docker & Docker Compose:** Configuração de ambiente isolado com `Node.js 20-alpine` e `MongoDB 6.0`. Implementação de *multi-stage build* para otimização de imagem.
* **Conexão com Banco de Dados:** Módulo `src/config/connectDB.js` implementado com tratamento de erros e suporte a variáveis de ambiente (`process.env.MONGO_URI`).

### 1.2. Modelagem de Dados (Camada de Dados)
* **User Model:** Schema definido com suporte a RBAC (`ADMIN`, `COORDINATOR`, `STUDENT`) e suporte a múltiplos cursos por usuário.
* **Activity Model:** Estrutura completa para submissão, incluindo campos para auditoria de OCR (`ocrText`) e estados de aprovação (`PENDING`, `APPROVED`, `REJECTED`).
* **Course & Category Model:** Implementação de subdocumentos para regras de categorias, permitindo limites dinâmicos de horas por curso (ex: Extensão, Pesquisa).

### 1.3. Segurança e Autorização
* **RBAC Middleware:** Middleware `authorize.js` funcional, permitindo a proteção de rotas com base no nível de privilégio do usuário autenticado.

---

## 2. Configuração e Inicialização (NPM)

### 2.1. Comandos de Setup
```bash
# Inicialização
npm init -y

# Instalação de dependências core
npm install express mongoose dotenv jsonwebtoken cors multer tesseract.js bcryptjs

# Ferramentas de desenvolvimento
npm install -D nodemon
```

### 2.2. Scripts do `package.json`
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 3. Arquitetura de Pastas
```text
backend/
├── src/
│   ├── config/      # [FEITO] Conexão DB e Dotenv
│   ├── controllers/ # [PENDENTE] Orquestração de requisições
│   ├── services/    # [PENDENTE] Lógica de validação de horas
│   ├── models/      # [FEITO] Schemas Mongoose (User, Activity, Course)
│   ├── middlewares/ # [FEITO] Auth RBAC
│   ├── routes/      # [PENDENTE] Definição de endpoints
│   └── app.js       # [PENDENTE] Configuração Express
├── server.js        # [FEITO] Entry point
└── Dockerfile       # [FEITO] Build de produção
```

---

## 4. Gaps de Requisitos (O que falta implementar)

Com base na análise do projeto `Projeto Integrador 3 2026.1.pdf` e no código , os seguintes itens **faltam** ou precisam de implementação para atingir 100% de conformidade:

### 4.1. Módulo de OCR (Leitura de Certificados)
* **Requisito:** "Uso opcional de OCR para leitura de certificados enviados como imagem" (pág. 2).
* **O que falta:** Integração da biblioteca `tesseract.js` no `ActivityService`.
* **Fundamentação:** O schema já possui o campo `ocrText`, mas a lógica de extração no upload não foi codificada.

### 4.2. Sistema de Notificações por E-mail
* **Requisito:** "Envio automático de notificações por e-mail" (pág. 2).
* **O que falta:** Implementação de um serviço de mailer (ex: `Nodemailer`) disparado no `controller` de aprovação/rejeição de atividades.

### 4.3. Lógica de Validação de Limites (Business Rules)
* **Requisito:** "Controle por curso, definição de limites de horas por área" (pág. 2).
* **O que falta:** Uma função no `ActivityService` que, antes de salvar uma atividade, consulte o `Course model` para verificar se a `hoursClaimed` não ultrapassa o `maxHours` da categoria específica.

### 4.4. Segurança: Hash de Senha
* **Requisito:** "O sistema deve contemplar autenticação" (pág. 2).
* **O que falta:** Middleware de pre-save no `UserSchema` para realizar o hash da senha usando `bcryptjs`.
* **Justificativa Técnica:** Armazenar senhas em texto plano viola o princípio de *Security by Design* (OWASP A07:2021).

---

## 5. Definição de Variáveis de Ambiente (`.env`)
O backend exige os seguintes parâmetros para operação:
* `MONGO_URI`: String de conexão com o MongoDB.
* `JWT_SECRET`: Chave privada para assinatura de tokens.
* `PORT`: Porta de execução (padrão: 3000).

---

## 6. Justificativa Técnica de Design

* **Separação de Preocupações:** O uso de `services/` garante que a lógica de cálculo de horas (complexa devido aos limites por categoria) não polua os `controllers`.
* **Escalabilidade de Perfis:** O middleware `authorize` utiliza verificação baseada em array (`roles.includes`), permitindo que uma rota seja acessível por múltiplos perfis simultaneamente (ex: ADMIN e COORDINATOR).

