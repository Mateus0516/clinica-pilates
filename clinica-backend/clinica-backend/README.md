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
O paciente pode manter uma reserva ativa por dia. O saldo segue as regras de
planos e créditos legados descritas abaixo. Cancelamentos com seis horas
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

## Planos e pagamentos simulados

O catálogo vem da tabela `planos`. O script `sql/catalogo-dev.sql` insere uma
oferta de teste após o Spring criar o esquema. A aplicação não cadastra ofertas
na inicialização. O catálogo pode ser administrado futuramente sem alterações
nas regras de contratação. Cada contratação guarda uma cópia da oferta e o
pagamento guarda o valor da cobrança.

| Método | Rota | Uso |
|---|---|---|
| GET | `/planos` | Catálogo disponível |
| GET | `/planos/contratacoes` | Plano ativo, pedido pendente e histórico |
| POST | `/planos/contratacoes` | Pedido com `planoCodigo`, `chave` UUID e, para renovação, `renovacaoDeId` |
| GET | `/pagamentos` | Cobranças e pagamentos do paciente |
| GET | `/pagamentos/{id}` | Detalhes do registro simulado |
| GET / PUT | `/pagamentos/metodo` | Preferência simulada de pagamento |
| POST | `/pagamentos/{id}/simulacao` | Simula aprovação e concede sessões |

As rotas exigem JWT de paciente. Envie `{"forma":"PIX"}` ou
`{"forma":"CARTAO_CREDITO"}` nas operações de forma de pagamento. Nenhuma
operação recebe dados bancários. A cobrança inicial fica sem vencimento definido. A cobrança de renovação
exibe o vencimento da contratação anterior como referência. O pedido
pendente continua disponível para conclusão e é separado do histórico.

A vigência começa com a confirmação simulada. A renovação pode ser solicitada
a partir do vencimento, usando a oferta então disponível. Somente um pedido
pendente ou plano vigente pode existir por paciente. A chave do pedido e o
bloqueio do paciente tornam reenvios e confirmações concorrentes seguros.
O segundo envio de uma confirmação paga retorna o registro existente.

A atualização do esquema preserva os saldos persistidos e as reservas.
Contas preexistentes sem saldo materializado continuam com oito sessões.
Contas cadastradas após a atualização começam com zero. Os créditos aprovados
somam ao saldo e não expiram. Agendamentos consomem primeiro o saldo legado e
depois o crédito da contratação mais antiga disponível. Uma devolução de
agendamento retorna ao mesmo crédito. Isso permite exibir o progresso real de
cada contratação sem misturar o saldo geral com as sessões do plano atual.
Cancelamento comercial e estorno não fazem parte do fluxo.

## Notificações internas

As rotas exigem JWT de paciente. O destinatário sempre vem da identidade
autenticada. Não existe rota pública de criação.

| Método | Rota | Operação |
|---|---|---|
| GET | `/notificacoes` | Lista a caixa do paciente |
| GET | `/notificacoes/nao-lidas` | Conta os itens não lidos |
| PUT | `/notificacoes/{id}/leitura` | Marca um item como lido |
| PUT | `/notificacoes/leitura` | Marca todos como lidos |
| DELETE | `/notificacoes/{id}` | Remove um item da caixa |
| DELETE | `/notificacoes` | Remove todos os itens da caixa |

Reserva, cancelamento com resultado da devolução, pagamento simulado, ativação
e renovação gravam os avisos na mesma transação do evento de origem. A tabela
`notificacoes` guarda o destinatário, evento, referência, conteúdo e horários
de criação, leitura e exclusão. A chave única de destinatário, evento e referência
continua valendo após uma exclusão lógica e após reiniciar a aplicação.

As rotinas consultam o MySQL a cada cinco minutos no fuso `America/Sao_Paulo`.
O aviso de aula entra na janela de 24 horas anteriores ao início e só é gerado
enquanto a reserva estiver ativa. Os avisos de plano tornam-se elegíveis às 9h,
três dias corridos antes do vencimento e novamente na data do vencimento.
Após indisponibilidade, a rotina retoma avisos ainda aplicáveis. O lembrete
prévio é descartado quando a vigência termina. O aviso de vencimento pode ser
recuperado enquanto o contrato vencido for a última contratação ativada do
paciente. O estado é conferido novamente sob bloqueio antes de gravar o aviso.
Em testes, use `timely.notificacoes.cron=-` para desativar a execução automática.

As notificações antigas do navegador ficam preservadas em sua chave local.
A caixa integrada usa somente os registros verificados pelo backend. As
preferências de comunicação continuam separadas das notificações internas.
