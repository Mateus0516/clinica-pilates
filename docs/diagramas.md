# Diagramas da área do paciente

Os quatro diagramas abaixo usam fonte Mermaid editável. As versões em PNG do
projeto ficam disponíveis como referência histórica: [casos de uso](../diagrama%20de%20caso%20de%20uso.png),
[classes](../Diagrama%20de%20Classes.png), [sequência](../Diagrama%20de%20sequ%C3%AAncia%20.png) e
[DER](../Diagrama%20Entidade%20e%20Relacionamento.png).

## Casos de uso

```mermaid
flowchart LR
  V["Visitante"] --> C(["Cadastrar conta"])
  V --> L(["Entrar"])
  P["Paciente autenticado"] --> D(["Consultar Dashboard e saldo"])
  P --> A(["Procurar horários e reservar aula"])
  P --> M(["Consultar, confirmar intenção e cancelar reserva"])
  P --> H(["Consultar histórico"])
  P --> F(["Editar perfil, endereço, preferências e senha"])
  P --> T(["Consultar, contratar e renovar plano"])
  P --> S(["Simular pagamento e consultar comprovante"])
  P --> N(["Consultar, marcar e excluir notificações internas"])
  P --> J(["Pesquisar na Central de Ajuda"])
  P --> O(["Sair"])
  R["Rotina do Timely"] --> N
```

## Classes principais

```mermaid
classDiagram
  class Usuario {
    Long id
    String email
    String senhaHash
    String perfil
    Long versaoCredencial
    trocarSenha(hash)
    atualizarEndereco(...)
    atualizarPreferencias(...)
  }
  class Instrutor {
    String codigo
    String nome
  }
  class Aula {
    Long id
    LocalDate data
    LocalTime horario
  }
  class Agendamento {
    Long id
    Instant canceladoEm
    Instant intencaoPresencaConfirmadaEm
    boolean sessaoDevolvida
    cancelar(...)
    confirmarIntencaoPresenca(...)
  }
  class SaldoSessoes {
    int disponiveis
    descontar()
    devolver()
    creditar(sessoes)
  }
  class Plano {
    String codigo
    BigDecimal valor
    int sessoes
    int meses
  }
  class ContratacaoPlano {
    String chavePedido
    BigDecimal valorContratado
    LocalDate vencimento
    int sessoesRestantes
    ativar(data)
    consumirCredito()
    devolverCredito()
  }
  class PagamentoPlano {
    BigDecimal valor
    Instant pagoEm
    Forma forma
    registrarSimulacao(...)
  }
  class Notificacao {
    Evento evento
    Long origemId
    Instant lidaEm
    Instant excluidaEm
    dto()
  }
  class AuthService {
    cadastrar(...)
    login(...)
  }
  class PerfilService {
    atualizar(...)
    trocarSenha(...)
  }
  class JwtService {
    gerarToken(...)
    verificar(...)
  }
  class AgendamentoService {
    reservar(...)
    cancelar(...)
    consultarSaldo(...)
  }
  class PlanosService {
    contratar(...)
    simularPagamento(...)
  }
  class NotificacaoService {
    registrar(...)
    listar(...)
    marcar(...)
    excluir(...)
  }
  Usuario "1" -- "0..1" SaldoSessoes
  Usuario "1" -- "0..*" Agendamento
  Usuario "1" -- "0..*" Notificacao
  Usuario "1" -- "0..*" ContratacaoPlano
  Instrutor "1" -- "0..*" Aula
  Aula "1" -- "0..*" Agendamento
  Plano "1" -- "0..*" ContratacaoPlano
  ContratacaoPlano "0..1" -- "0..*" Agendamento
  ContratacaoPlano "1" -- "0..1" PagamentoPlano
  ContratacaoPlano "0..1" -- "0..1" ContratacaoPlano : renova
  AuthService ..> JwtService
  AuthService ..> Usuario
  PerfilService ..> Usuario
  AgendamentoService ..> NotificacaoService
  PlanosService ..> NotificacaoService
  NotificacaoService ..> Notificacao
```

## Sequências

```mermaid
sequenceDiagram
  actor P as Paciente
  participant F as Frontend
  participant API as REST / Spring Security
  participant DB as MySQL
  P->>F: Entra com credenciais
  F->>API: POST /auth/login
  API->>DB: Consulta usuário e versão da credencial
  API->>API: Verifica BCrypt e assina JWT
  API-->>F: JWT com ID e versão
  F->>API: GET /auth/me com Bearer
  API->>DB: Confere ID, versão e perfil
  API-->>F: Sessão validada
  P->>F: Escolhe um horário
  F->>API: GET /aulas/vagas
  API-->>F: Disponibilidade
  F->>API: POST /agendamentos
  API->>DB: Bloqueia paciente e instrutor, valida vaga e saldo
  API->>DB: Reserva, debita e grava notificação na mesma transação
  API-->>F: 201 Reserva
  P->>F: Confirma cancelamento
  F->>API: POST /agendamentos/id/cancelamento
  API->>DB: Bloqueia, verifica titularidade e cancela
  opt Pelo menos 6 horas de antecedência
    API->>DB: Devolve crédito à origem
  end
  API->>DB: Grava notificação de cancelamento
  API-->>F: 200 Reserva cancelada
```

```mermaid
sequenceDiagram
  actor P as Paciente
  participant F as Frontend
  participant API as REST / PlanosService
  participant DB as MySQL
  P->>F: Escolhe oferta ou renovação
  F->>API: POST /planos/contratacoes
  API->>DB: Bloqueia paciente e valida catálogo e chave
  API->>DB: Grava contratação pendente e cobrança com valor do catálogo
  API-->>F: Cobrança simulada
  P->>F: Escolhe forma simulada e confirma
  F->>API: POST /pagamentos/id/simulacao
  API->>DB: Bloqueia paciente e consulta cobrança própria
  alt Cobrança já paga
    API-->>F: Retorna a mesma confirmação
  else Cobrança pendente
    API->>DB: Ativa, credita e registra pagamento e notificações
    API-->>F: Confirmação e referência do comprovante
  end
  F->>API: Atualiza plano, saldo e notificações
```

## DER

```mermaid
erDiagram
  USUARIOS ||--o| SALDOS_SESSOES : possui
  USUARIOS ||--o{ AGENDAMENTOS : reserva
  USUARIOS ||--o{ CONTRATACOES_PLANO : contrata
  USUARIOS ||--o{ NOTIFICACOES : recebe
  INSTRUTORES ||--o{ AULAS : instrui
  AULAS ||--o{ AGENDAMENTOS : agrupa
  PLANOS ||--o{ CONTRATACOES_PLANO : oferta
  CONTRATACOES_PLANO o|--o{ AGENDAMENTOS : origina_credito
  CONTRATACOES_PLANO o|--o| CONTRATACOES_PLANO : renova
  CONTRATACOES_PLANO ||--o| PAGAMENTOS_PLANO : cobranca
  USUARIOS {
    bigint id PK
    varchar nome
    varchar email UK
    varchar senha_hash
    bigint versao_credencial
    varchar telefone
    date data_nascimento
    varchar perfil
    varchar endereco
    varchar bairro
    varchar cidade
    varchar estado
    varchar cep
    boolean prefere_email
    boolean prefere_whatsapp
    boolean prefere_push
    boolean saldo_legado
    varchar forma_pagamento_simulado
  }
  INSTRUTORES {
    varchar codigo PK
    varchar nome
  }
  AULAS {
    bigint id PK
    date data_aula
    time horario
    varchar instrutor_codigo FK
  }
  AGENDAMENTOS {
    bigint id PK
    bigint paciente_id FK
    bigint aula_id FK
    bigint contratacao_credito_id FK
    datetime criado_em
    datetime cancelado_em
    datetime intencao_presenca_confirmada_em
    boolean sessao_devolvida
  }
  SALDOS_SESSOES {
    bigint paciente_id PK,FK
    int disponiveis
  }
  PLANOS {
    varchar codigo PK
    varchar nome
    varchar descricao
    varchar servico
    decimal valor
    int sessoes
    int meses
    boolean disponivel
    varchar beneficios
  }
  CONTRATACOES_PLANO {
    bigint id PK
    bigint paciente_id FK
    varchar plano_codigo FK
    bigint renovacao_de_id FK,UK
    datetime contratado_em
    date inicio
    date vencimento
    decimal valor_contratado
    int sessoes_contratadas
    int meses_contratados
    varchar chave_pedido
    varchar nome_contratado
    varchar descricao_contratada
    varchar servico_contratado
    varchar beneficios_contratados
    int sessoes_restantes
  }
  PAGAMENTOS_PLANO {
    bigint id PK
    bigint contratacao_id FK,UK
    decimal valor
    datetime criado_em
    date vencimento
    datetime pago_em
    enum forma
  }
  NOTIFICACOES {
    bigint id PK
    bigint paciente_id FK
    varchar evento
    bigint origem_id
    varchar titulo
    varchar mensagem
    datetime criada_em
    datetime lida_em
    datetime excluida_em
  }
```

Restrições compostas:

- Uma aula por `data_aula, horario, instrutor_codigo`.
- Uma contratação por `paciente_id, chave_pedido`.
- Uma notificação por `paciente_id, evento, origem_id`, inclusive após exclusão lógica.
- A referência da notificação é polimórfica. O evento indica a entidade de origem.
- A capacidade por aula, a reserva única por paciente/dia e a concessão de créditos
  são controladas pelas transações dos serviços. As versões atuais não usam
  índices únicos para essas três regras.
