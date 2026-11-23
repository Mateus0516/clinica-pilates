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

## Aulas, agendamentos e sessões

Os endpoints abaixo exigem JWT de paciente no cabeçalho
`Authorization: Bearer <JWT_DO_PACIENTE>`. O paciente é identificado pelo
token. O corpo da reserva recebe apenas a data, o horário e o código do instrutor.

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/aulas?inicio=2027-01-04&fim=2027-01-09` | Consulta horários futuros, incluindo lotados, em um período inclusivo de até 31 dias |
| GET | `/aulas/vagas?data=2027-01-04&horario=09:00&instrutorCodigo=ana` | Consulta a capacidade e as vagas para um horário |
| POST | `/agendamentos` | Cria uma reserva e desconta uma sessão |
| GET | `/agendamentos` | Lista as reservas futuras do paciente |
| POST | `/agendamentos/{id}/cancelamento` | Cancela uma reserva futura e informa se houve devolução da sessão |
| PUT | `/agendamentos/{id}/intencao-presenca` | Registra a intenção de comparecer. Repetir a chamada mantém a primeira confirmação |
| GET | `/agendamentos/historico` | Lista reservas canceladas e aulas cujo horário atingiu o início |
| GET | `/sessoes/saldo` | Consulta o saldo de sessões do paciente |

Exemplo de reserva. Escolha uma data futura na agenda.

```http
POST /agendamentos
Authorization: Bearer <JWT_DO_PACIENTE>
Content-Type: application/json

{"data":"2027-01-04","horario":"09:00","instrutorCodigo":"ana"}
```

O fuso da clínica é `America/Sao_Paulo`. A grade funciona de segunda a
sábado com Ana (`ana`) e Bruno (`bruno`), às 07h, 08h, 09h, 10h, 11h, 14h,
15h, 16h, 17h, 18h e 19h. Cada horário comporta três pacientes por instrutor.
O paciente pode manter uma reserva ativa por dia. O saldo provisório começa
em oito sessões até a integração dos planos. Cancelamentos com seis horas
ou mais de antecedência devolvem uma sessão. O histórico preserva a reserva
cancelada e o campo `sessaoDevolvida`. O campo
`intencaoPresencaConfirmadaEm` registra a confirmação pelo paciente.
`ENCERRADO` indica que o horário da aula chegou. O comparecimento efetivo
dependerá de registro pelo profissional.

### Esquema e concorrência

O Hibernate usa a configuração existente `ddl-auto=update` para criar
`instrutores`, `aulas`, `agendamentos` e `saldos_sessoes`. A inicialização
inclui Ana e Bruno quando ausentes. A ocorrência da aula e o saldo são
persistidos sob demanda. Os vínculos de reserva e de saldo usam a tabela
`usuarios`, que mantém as colunas existentes. As chaves estrangeiras
preservam o vínculo histórico com o paciente e o instrutor.

Reserva e cancelamento usam transações com isolamento `READ_COMMITTED`.
O bloqueio pessimista do paciente serializa as alterações do saldo e a
verificação de uma reserva por dia. O bloqueio pessimista do instrutor
serializa alterações na ocupação, inclusive antes de a ocorrência existir.

### Verificação com MySQL 8

Em uma instância MySQL 8 de teste, crie um esquema vazio e isolado.
Configure `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD` e `JWT_SECRET` no ambiente e rode `mvn test`
com JDK 17. A suíte grava usuários e reservas de teste, então use um
esquema novo para cada execução. Para checar a atualização de uma base já
populada, repita em uma cópia de teste do esquema anterior e confira se os
registros de usuários permanecem após a criação das quatro tabelas.

## Perfil do paciente

`GET /auth/me` consulta o usuário autenticado. `PUT /auth/me` atualiza
`nome`, `email`, `telefone` e `dataNascimento` do paciente identificado
pelo token. A data usa `AAAA-MM-DD`. O e-mail é normalizado, e um endereço
em uso retorna HTTP 409.

`PUT /auth/me/senha` recebe `senhaAtual`, `novaSenha` e
`confirmacaoNovaSenha`. A nova senha deve ter pelo menos oito caracteres,
com letra e número, e no máximo 72 bytes em UTF-8. O sucesso retorna HTTP 204
e exige novo login em todas as sessões do usuário.

Os JWTs emitidos nesta versão usam o ID do usuário como assunto e incluem uma
versão de credencial. A alteração de e-mail preserva o ID e a sessão existente.
A troca de senha grava o hash BCrypt e incrementa a versão na mesma transação.
O filtro valida a versão contra o banco a cada requisição. Tokens legados
identificados pelo e-mail exigem novo login após a atualização do backend.

O Hibernate adiciona a coluna anulável `usuarios.versao_credencial`.
Registros com valor nulo usam a versão zero. Os hashes e dados existentes são
preservados.

O campo opcional `endereco` de `PUT /auth/me` aceita `logradouro`, `bairro`,
`cidade`, `estado` (UF) e `cep`. A omissão do objeto preserva o endereço,
enquanto campos vazios no objeto limpam seus valores. O CEP é salvo com oito
dígitos. `GET /auth/me` devolve o endereço e as preferências atuais.

`PUT /auth/me/preferencias` salva os três booleanos `email`, `whatsapp` e
`push` do paciente autenticado. As colunas são anuláveis e usuários existentes
mantêm o padrão anterior de opções ligadas. Esta API armazena escolhas de
comunicação e não dispara mensagens.
