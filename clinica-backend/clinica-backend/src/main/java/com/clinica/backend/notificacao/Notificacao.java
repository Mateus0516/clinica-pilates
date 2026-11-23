package com.clinica.backend.notificacao;

import com.clinica.backend.model.Usuario;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notificacoes", uniqueConstraints = @UniqueConstraint(
        name = "uk_notificacao_evento", columnNames = {"paciente_id", "evento", "origem_id"}),
        indexes = @Index(name = "ix_notificacao_caixa", columnList = "paciente_id,excluida_em,criada_em"))
public class Notificacao {
    enum Tipo { confirmacao, aula, lembrete, cancelamento }

    public enum Evento {
        AGENDAMENTO(Tipo.confirmacao, "/aulas"),
        CANCELAMENTO(Tipo.cancelamento, "/historico"),
        AULA_PROXIMA(Tipo.aula, "/aulas"),
        PAGAMENTO(Tipo.confirmacao, "/gerenciar-pagamentos"),
        PLANO_ATIVADO(Tipo.confirmacao, "/detalhes-plano"),
        PLANO_RENOVADO(Tipo.confirmacao, "/detalhes-plano"),
        PLANO_A_VENCER(Tipo.lembrete, "/detalhes-plano"),
        PLANO_VENCIDO(Tipo.lembrete, "/meus-planos");

        final Tipo tipo;
        final String destino;

        Evento(Tipo tipo, String destino) {
            this.tipo = tipo;
            this.destino = destino;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Evento evento;

    @Column(name = "origem_id", nullable = false)
    private Long origemId;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String mensagem;

    @Column(name = "criada_em", nullable = false)
    private Instant criadaEm;

    private Instant lidaEm;

    @Column(name = "excluida_em")
    private Instant excluidaEm;

    protected Notificacao() {}

    Notificacao(Usuario paciente, Evento evento, Long origemId, String titulo, String mensagem, Instant criadaEm) {
        this.paciente = paciente;
        this.evento = evento;
        this.origemId = origemId;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.criadaEm = criadaEm;
    }

    NotificacaoDto dto() {
        return new NotificacaoDto(id, evento.tipo.name(), titulo, mensagem, criadaEm, lidaEm != null,
                evento.name(), origemId, evento.destino);
    }
}
