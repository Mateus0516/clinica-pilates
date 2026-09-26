
# 🏥 Sistema de Gestão e Autoatendimento para Clínicas

Sistema desenvolvido para gerenciamento de pacientes, autenticação de usuários e suporte ao autoatendimento em clínicas.

O projeto foi desenvolvido como atividade acadêmica, aplicando conceitos de **Engenharia de Software, Arquitetura em Camadas, APIs REST, Banco de Dados, Docker e Documentação de Software**.

---

## 📌 Funcionalidades

- ✅ Cadastro de pacientes
- ✅ Login com autenticação segura utilizando BCrypt
- ✅ Consulta de usuários cadastrados
- ✅ Atualização de dados cadastrais
- ✅ Exclusão de usuários
- ✅ Integração Frontend + Backend
- ✅ API REST documentada com Swagger
- ✅ Persistência de dados em MySQL
- ✅ Banco de dados executando em container Docker
- ✅ Tratamento de erros e exceções
- ✅ Testes automatizados

---

## 🛠 Tecnologias Utilizadas

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven

### Banco de Dados

- MySQL
- Docker

### Documentação

- Swagger OpenAPI

### Testes

- JUnit 5
- Spring Boot Test

---

## 🏗 Arquitetura do Projeto

O backend foi desenvolvido utilizando **arquitetura em camadas**, composta por:

- **Controller:** gerenciamento das requisições HTTP e dos endpoints da API.
- **Service:** implementação das regras de negócio.
- **Repository:** comunicação com o banco de dados.
- **Model:** representação das entidades do sistema.
- **Config:** configurações gerais da aplicação.

Essa organização facilita a manutenção, a escalabilidade e a reutilização do código.

---

## 📂 Estrutura do Projeto

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

> **Observação:** o nome da pasta original foi mantido para preservar a compatibilidade com o repositório existente.

---

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Mateus0516/clinica-pilates.git
```

### 2. Entrar na pasta do projeto

```bash
cd clinica-pilates
```

### 3. Iniciar o Banco de Dados (Docker)

Executar o container MySQL:

```bash
docker start clinica-mysql
```

Verificar os containers ativos:

```bash
docker ps
```

**Observação:** o container `clinica-mysql` deve estar previamente criado e configurado.

### 4. Executar o Backend

Em um terminal, execute:

```bash
cd clinica-backend/clinica-backend
mvn spring-boot:run
```

O backend estará disponível em:

```text
http://localhost:8080
```

### 5. Executar o Frontend

Abra outro terminal na pasta principal do projeto e execute:

```bash
npm install
npm run dev
```

O frontend estará disponível em:

```text
http://localhost:5173
```

---

## 📘 Documentação da API — Swagger

A documentação interativa da API pode ser acessada pelo endereço:

http://localhost:8080/swagger-ui/index.html

O Swagger permite visualizar os endpoints disponíveis, consultar os parâmetros das requisições e testar as operações da API.

---

## 🗄 Banco de Dados

O projeto utiliza MySQL para persistência dos dados, executado em um container Docker.

| Configuração | Valor |
|---|---|
| Banco de dados | MySQL |
| Nome do banco | `clinica_db` |
| Container | `clinica-mysql` |
| Porta | `3307` |
| ORM | JPA / Hibernate |

---

## 🔐 Principais Endpoints

A API REST disponibiliza os seguintes endpoints:

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastrar usuário |
| POST | `/auth/login` | Autenticar usuário |
| GET | `/auth/usuarios` | Listar usuários |
| GET | `/auth/usuarios/{id}` | Buscar usuário por ID |
| PUT | `/auth/usuarios/{id}` | Atualizar usuário |
| DELETE | `/auth/usuarios/{id}` | Excluir usuário |

### Segurança

O sistema utiliza **BCrypt** para armazenar senhas de forma protegida, evitando o armazenamento de senhas em texto puro.

---

## 🧪 Testes Automatizados

O projeto possui testes automatizados utilizando **JUnit 5** e **Spring Boot Test**.

Para executar os testes, acesse o diretório do backend e utilize:

```bash
mvn test
```

### Resultado obtido

```text
Tests run: 5
Failures: 0
Errors: 0
BUILD SUCCESS
```

Os cinco testes executados foram concluídos sem falhas ou erros.

---

## 📋 Requisitos Atendidos

- [x] Documento de Requisitos de Negócio (BRD)
- [x] Documento de Especificação de Requisitos (ERS/SRS)
- [x] Planejamento e Cronograma
- [x] Diagramas UML
- [x] API REST
- [x] CRUD Completo
- [x] Swagger Documentado
- [x] Tratamento de Erros
- [x] Testes Automatizados
- [x] Banco de Dados com ORM (JPA/Hibernate)
- [x] Docker
- [x] Integração Frontend + Backend
- [x] Arquitetura Organizada
- [x] Clean Code
- [x] README do Projeto

---

## 👨‍💻 Desenvolvido por

| Integrante | Responsabilidade |
|---|---|
| Mateus Cavalcante Rodrigues | Desenvolvimento do projeto |
| Pablo Perri Ferreira | Protótipo de telas e ajustes |
| Caio Henrique Silva França Dib | Documentação do projeto |

---

**Projeto acadêmico — Sistema de Gestão e Autoatendimento para Clínicas.**
