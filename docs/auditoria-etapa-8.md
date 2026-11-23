# Auditoria da área do paciente

Base auditada: `c20004e` na `main`. A [especificação](../especificacao) do
repositório descreve o trabalho acadêmico, mas não está identificada como
documento original do professor. A lista de exigências foi tomada do pedido
da Etapa 8.

## Matriz acadêmica

| Requisito | Situação | Evidência | Pendência |
|---|---|---|---|
| Login seguro | Atendido | `AuthService`, `JwtService`, `JwtAuthenticationFilter`, `AuthSecurityTest` | Configurar chave privada por ambiente |
| Operações CRUD | Parcialmente atendido | Cadastro, consulta e edição de perfil, reservas e notificações. `AuthController` tem listagem, edição e exclusão de usuários restritas a ADMIN. | CRUD administrativo de planos e instrutores e interfaces profissionais/administrativas |
| Swagger | Atendido | Springdoc, `OpenApiConfig`, quatro controllers e Swagger UI | Manter o contrato atualizado |
| Tratamento de erros | Atendido | `GlobalExceptionHandler`, filtro Spring Security e validações de domínio | Mensagens para conflitos de integridade sem detalhes internos |
| Pelo menos cinco testes | Atendido | Suíte JUnit do backend | Frontend ainda sem suíte própria versionada |
| Banco em Docker | Atendido | `docker-compose.yml`, imagem MySQL 8 e validação isolada | Credencial externa ao código |
| Casos de uso | Atendido | [Diagrama editável](diagramas.md#casos-de-uso) | Atualizar conforme os módulos futuros |
| Classes | Atendido | [Diagrama editável](diagramas.md#classes-principais) | Idem |
| Sequência | Atendido | [Diagramas editáveis](diagramas.md#sequências) | Idem |
| DER | Atendido | [Nove tabelas e vínculos](diagramas.md#der) | Idem |
| Planejamento e cronograma | Parcialmente atendido | [Marcos verificáveis](planejamento.md) | Calendário formal e datas das fases futuras |
| README | Atendido | [README principal](../README.md) e [backend](../clinica-backend/clinica-backend/README.md) | Manter instruções e pré-requisitos atualizados |

## Conclusões por área

- **Conta e sessão.** Cadastro e perfil compartilham validação no servidor.
  Login e logout usam JWT em `sessionStorage`, com autenticação por ID e
  revogação por versão. Alteração de endereço, senha e preferências persiste
  no MySQL. O logout descarta o cache da conta.
- **Dashboard, Agenda, Minhas Aulas e Histórico.** Disponibilidade, saldo e
  histórico são obtidos da API. A Agenda informa quando a data já passou.
  Horários lotados continuam visíveis e indisponíveis. O Dashboard usa
  contagens de reservas, não presença. O Histórico distingue encerramento,
  cancelamento e devolução. Taxa de presença e data de adesão permanecem
  indisponíveis no Perfil.
- **Planos e pagamentos.** Catálogo e histórico saem do MySQL. A contratação
  conserva as condições originais. A confirmação simulada é idempotente e
  aplica créditos sob bloqueio do paciente. A API não processa dados bancários.
- **Notificações e Ajuda.** A caixa, sino e sidebar compartilham dados da API.
  A deduplicação persiste após exclusão lógica. A Ajuda mantém perguntas,
  atalhos e busca estáticos. Os contatos da clínica continuam informativos.
- **Persistência e concorrência.** Bloqueios por paciente e instrutor protegem
  a capacidade e o saldo. Reservas, créditos e avisos seguem a transação do
  evento. O pedido usa chave por paciente e há uma cobrança por contratação.
  O token fica na sessão da aba. As chaves antigas de dados locais não são
  migradas. O saldo simulado residual no código foi removido.
- **Configuração.** O Compose exige senha externa e publica o MySQL apenas
  no loopback. Uma senha presente em versões anteriores do Git deve ser
  tratada como conhecida caso tenha sido reutilizada. Nenhum histórico Git foi
  reescrito. A configuração local usa Hibernate `ddl-auto=update`. Um
  processo formal de migração e credenciais próprias de produção fica pendente.
- **Acessibilidade móvel.** A sidebar inicia recolhida em telas estreitas e pode ser expandida.
  As tabelas largas mantêm rolagem interna. As dez rotas do paciente foram
  medidas em uma janela de 390 px.

## Evidência da Etapa 8

- MySQL 8 descartável: 46 testes JUnit aprovados e nenhuma falha. Os 44
  testes anteriores rodaram junto com dois novos casos de entradas inválidas.
- O esquema criado foi conferido por `information_schema`, incluindo as
  nove tabelas, as chaves estrangeiras e as três restrições únicas compostas.
- Chrome: cadastro, login, contratação, pagamento simulado, saldo de 0 a 16,
  reserva e cancelamento com saldo de 16 a 15 e de volta a 16, Histórico,
  Perfil, troca de senha, notificações, Ajuda e logout. O fluxo também
  verificou isolamento, CORS, entradas inválidas e revogação do JWT.
- Swagger UI: `GET /auth/me` executado com JWT e resposta HTTP 200. O
  contrato OpenAPI publicou 31 operações.
- As dez páginas auditadas tinham largura de conteúdo igual à janela de
  390 px com o menu recolhido. Em desktop, as três páginas de planos e
  pagamentos mantiveram os títulos e cartões comparados com `c20004e`.
- TypeScript, build de produção, validação do Compose e `git diff --check`
  aprovados.
