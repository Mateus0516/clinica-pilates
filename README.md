# Timely

Sistema de gestão e autoatendimento para uma clínica de Pilates. A área do
paciente reúne cadastro e login, Dashboard, Agenda, Minhas Aulas, Histórico,
Perfil, planos, pagamentos simulados, notificações internas e Central de Ajuda.

## Arquitetura

O frontend React 19 e TypeScript usa Vite, TanStack Router, TanStack Query e
Tailwind. A API REST usa Java 17, Spring Boot 3, Spring Security, BCrypt,
JWT, Spring Data JPA e Hibernate. O MySQL 8 roda em Docker. Swagger UI
publica o contrato OpenAPI, e a suíte usa JUnit e Spring Boot Test.

| Caminho | Conteúdo |
|---|---|
| `src/routes` | Páginas e proteção de rotas |
| `src/components` | Layout, formulários e componentes compartilhados |
| `src/lib` | Cliente REST, sessão e consultas |
| `clinica-backend/clinica-backend/src/main` | API, regras, entidades e configuração |
| `clinica-backend/clinica-backend/src/test` | Testes de autenticação e dos módulos de paciente |
| `clinica-backend/clinica-backend/sql` | Catálogo de desenvolvimento |
| `docs` | Diagramas editáveis, auditoria e planejamento |

## Execução local

Pré-requisitos: Node.js 22.12 ou superior, npm, JDK 17, Maven 3.9 e Docker com
Compose. Use ambientes e credenciais próprios para desenvolvimento.

1. Defina `DB_PASSWORD` e `JWT_SECRET` no ambiente do terminal. Gere uma chave JWT
   aleatória de pelo menos 32 bytes. O Compose usa `DB_PASSWORD` na criação
   de um volume novo. Em um volume existente, configure a senha que já está
   em vigor. Alterar a variável não altera a senha do MySQL já instalado.
2. Na raiz, execute `docker compose up -d mysql`. A porta local é `3307`.
3. Em `clinica-backend/clinica-backend`, execute `mvn spring-boot:run`. A API usa a porta `8080`.
4. Depois que o esquema de **desenvolvimento** estiver criado, execute
   `sql/catalogo-dev.sql` em `clinica_db` usando seu cliente MySQL.
5. Na raiz, execute `npm ci` e `npm run dev`. Abra `http://localhost:8081`.

| Variável | Uso |
|---|---|
| `DB_PASSWORD` | Senha do MySQL local, obrigatória |
| `DB_USER` | Usuário da conexão Spring, padrão local `root` |
| `DB_URL` | Padrão `jdbc:mysql://localhost:3307/clinica_db` |
| `JWT_SECRET` | Chave privada de assinatura JWT, obrigatória |
| `VITE_API_URL` | URL da API, padrão `http://localhost:8080`. Veja `.env.example`. |
| `TIMELY_NOTIFICACOES_CRON` | Agenda opcional das rotinas. Use `-` para desativar em testes. |

Use um terminal com as variáveis exportadas ao iniciar o Spring. A leitura do
arquivo `.env` pelo Compose ou Vite não exporta valores para o Maven.

## Swagger e testes

Abra `http://localhost:8080/swagger-ui/index.html`. Faça login em
`POST /auth/login` com uma conta de teste e use **Authorize** com o token
Bearer. Confirme a autenticação em `GET /auth/me`. O JSON está em
`/v3/api-docs`. A lista de rotas e as regras estão no [README do backend](clinica-backend/clinica-backend/README.md).

- Backend: aponte `DB_URL`, `DB_USER` e `DB_PASSWORD` para um **esquema MySQL 8 isolado**, configure `JWT_SECRET`, desative a rotina de lembretes no ambiente de teste e execute `mvn test` na pasta do backend. Use um esquema novo por execução.
- Frontend: execute `npx tsc --noEmit` e `npm run build` na raiz.
- Verificação do diff: execute `git diff --check`.

## Diagramas e planejamento

- [Casos de uso, classes, sequências e DER](docs/diagramas.md)
- [Planejamento e cronograma verificável](docs/planejamento.md)
- [Matriz acadêmica e auditoria](docs/auditoria-etapa-8.md)
- [Especificação original no repositório](especificacao)

## Limitações atuais

Os pagamentos são exclusivamente simulados, sem integração financeira real.
E-mail, WhatsApp e push externos e os contatos oficiais da clínica continuam
pendentes. A intenção do paciente de comparecer não equivale à presença
registrada pelo profissional. Indicadores de presença, faltas e frequência
dependem dessa etapa. A área profissional e a administrativa ainda são
parciais. A gestão administrativa de planos e instrutores fica para a fase
seguinte, mediante autorização.

## 👨‍💻 Desenvolvido por

| Integrante | Responsabilidade |
|---|---|
| Mateus Cavalcante Rodrigues | Desenvolvimento do projeto |
| Pablo Perri Ferreira | Protótipo de telas e ajustes |
| Caio Henrique Silva França Dib | Documentação do projeto |

---

**Projeto acadêmico — Sistema de Gestão e Autoatendimento para Clínicas.**
