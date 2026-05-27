# 🧘 Clínica Pilates — Sistema de Autoatendimento

Sistema desenvolvido para gerenciamento e autoatendimento de alunos de um Studio de Pilates.

O projeto possui:
- Frontend em React + TypeScript
- Backend em Spring Boot (Java)
- Banco de dados MySQL
- Docker para containerização
- Swagger para documentação da API

---

# 📌 Funcionalidades

✅ Cadastro de alunos  
✅ Login de usuários  
✅ Integração Frontend + Backend  
✅ API REST documentada com Swagger  
✅ Persistência de dados em MySQL  
✅ Banco rodando em container Docker  
✅ Arquitetura separada em camadas  
✅ Estrutura preparada para CRUD completo  

---

# 🛠 Tecnologias Utilizadas

## Frontend
- React
- TypeScript
- Vite
- TailwindCSS

## Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Maven

## Banco de Dados
- MySQL
- Docker

## Documentação
- Swagger OpenAPI

---

# 📂 Estrutura do Projeto

```bash
clinica-pilates/
│
├── src/                     # Frontend
│
├── clinica-backend/
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
│
├── docker-compose.yml
│
└── README.md
```

---

# 🚀 Como Executar o Projeto

## 1️⃣ Clonar o repositório

```bash
git clone https://github.com/Mateus0516/clinica-pilates.git
```

---

## 2️⃣ Entrar na pasta do projeto

```bash
cd clinica-pilates
```

---

# 🐳 3️⃣ Rodar o banco de dados com Docker

```bash
docker compose up -d
```

---

# ⚙️ 4️⃣ Rodar o Backend

Abrir outro terminal:

```bash
cd clinica-backend/clinica-backend
```

Rodar:

```bash
mvn spring-boot:run
```

Backend disponível em:

```bash
http://localhost:8080
```

---

# 🌐 5️⃣ Rodar o Frontend

Abrir outro terminal:

```bash
cd clinica-pilates
```

Instalar dependências:

```bash
npm install
```

Rodar projeto:

```bash
npm run dev
```

Frontend disponível em:

```bash
http://localhost:3000
```

ou

```bash
http://localhost:5173
```

---

# 📘 Swagger

Documentação da API:

```bash
http://localhost:8080/swagger-ui/index.html
```

---

# 🗄 Banco de Dados

Banco utilizado:

```bash
MySQL
```

Nome do banco:

```bash
clinica_db
```

Container Docker:

```bash
clinica-mysql
```

---

# 🔐 Endpoints Principais

## Cadastro

```http
POST /auth/register
```

## Login

```http
POST /auth/login
```

---

# 📋 Requisitos do Projeto Atendidos

✅ Levantamento de requisitos  
✅ Diagramas UML  
✅ API REST  
✅ Swagger documentado  
✅ Banco de dados com ORM  
✅ Docker  
✅ Integração Frontend + Backend  
✅ Arquitetura organizada  
✅ README do projeto  

---

# 👨‍💻 Desenvolvido por

Mateus Rodrigues  
Projeto Agendamento — Sistema de Clínica de Pilates
