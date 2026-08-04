# 🧘 Clínica Pilates — Sistema de Gestão e Autoatendimento

Sistema desenvolvido para gerenciamento de alunos, autenticação de usuários e suporte ao autoatendimento de um Studio de Pilates.

O projeto foi desenvolvido como atividade acadêmica, aplicando conceitos de Engenharia de Software, Arquitetura em Camadas, APIs REST, Banco de Dados, Docker e Documentação de Software.

---

# 📌 Funcionalidades

✅ Cadastro de alunos

✅ Login com autenticação segura utilizando BCrypt

✅ Consulta de usuários cadastrados

✅ Atualização de dados cadastrais

✅ Exclusão de usuários

✅ Integração Frontend + Backend

✅ API REST documentada com Swagger

✅ Persistência de dados em MySQL

✅ Banco de dados executando em container Docker

✅ Tratamento de erros e exceções

✅ Testes automatizados

---

# 🛠 Tecnologias Utilizadas

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS

## Backend

* Java 17
* Spring Boot
* Spring Data JPA
* Hibernate
* Maven

## Banco de Dados

* MySQL
* Docker

## Documentação

* Swagger OpenAPI

## Testes

* JUnit 5
* Spring Boot Test

---

# 🏗 Arquitetura do Projeto

O backend foi desenvolvido utilizando arquitetura em camadas:

* Controller
* Service
* Repository
* Model
* Config

Essa organização facilita manutenção, escalabilidade e reutilização do código.

---

# 📂 Estrutura do Projeto

```text
clinica-pilates/
│
├── src/                        # Frontend React
│
├── clinica-backend/
│   ├── src/main/java/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   └── config/
│   │
│   ├── src/test/java/
│   └── pom.xml
│
└── README.md
```

---

# 🚀 Como Executar o Projeto

## 1. Clonar o repositório

```bash
git clone https://github.com/Mateus0516/clinica-pilates.git
```

## 2. Entrar na pasta do projeto

```bash
cd clinica-pilates
```

---

# 🐳 Banco de Dados (Docker)

Executar o container MySQL:

```bash
docker start clinica-mysql
```

Verificar containers ativos:

```bash
docker ps
```

---

# ⚙️ Executar o Backend

```bash
cd clinica-backend/clinica-backend
mvn spring-boot:run
```

Backend disponível em:

```text
http://localhost:8080
```

---

# 🌐 Executar o Frontend

```bash
npm install
npm run dev
```

Frontend disponível em:

```text
http://localhost:5173
```

---

# 📘 Swagger

Documentação da API:

```text
http://localhost:8080/swagger-ui/index.html
```

---

# 🗄 Banco de Dados

Banco utilizado:

```text
MySQL
```

Nome:

```text
clinica_db
```

Container:

```text
clinica-mysql
```

Porta:

```text
3307
```

---

# 🔐 Principais Endpoints

### Cadastro de Usuário

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

### Listar Usuários

```http
GET /auth/usuarios
```

### Buscar Usuário por ID

```http
GET /auth/usuarios/{id}
```

### Atualizar Usuário

```http
PUT /auth/usuarios/{id}
```

### Excluir Usuário

```http
DELETE /auth/usuarios/{id}
```

---

# 🧪 Testes Automatizados

O projeto possui testes automatizados utilizando JUnit 5.

Resultado obtido:

```text
Tests run: 5
Failures: 0
Errors: 0
BUILD SUCCESS
```

---

# 📋 Requisitos Atendidos

✅ Documento de Requisitos de Negócio (BRD)

✅ Documento de Especificação de Requisitos (ERS/SRS)

✅ Planejamento e Cronograma

✅ Diagramas UML

✅ API REST

✅ CRUD Completo

✅ Swagger Documentado

✅ Tratamento de Erros

✅ Testes Automatizados

✅ Banco de Dados com ORM (JPA/Hibernate)

✅ Docker

✅ Integração Frontend + Backend

✅ Arquitetura Organizada

✅ Clean Code

✅ README do Projeto

---

# 👨‍💻 Desenvolvido por

Mateus Cavalcante Rodrigues

Projeto — Sistema de Gestão para Clínica de Pilates.
