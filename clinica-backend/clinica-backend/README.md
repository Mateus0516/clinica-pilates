# Clinica Backend

Backend Spring Boot para login/cadastro de alunos da clínica.

## Antes de rodar

1. Crie o banco no MySQL:

```sql
CREATE DATABASE clinica_db;
```

2. Abra `src/main/resources/application.properties`

Troque:

```properties
spring.datasource.password=SUA_SENHA_DO_MYSQL
```

pela sua senha real do MySQL.

## Rodar

```bash
mvn spring-boot:run
```

## Swagger

Depois de rodar, abra:

```text
http://localhost:8080/swagger-ui/index.html
```

## Rotas

Cadastro:

```http
POST /auth/register
```

Login:

```http
POST /auth/login
```
