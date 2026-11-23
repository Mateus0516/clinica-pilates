package com.clinica.backend.agendamento;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.planos.ContratacaoPlano;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "agendamentos", indexes = {
        @Index(name = "ix_agendamento_aula_cancelado", columnList = "aula_id,cancelado_em"),
        @Index(name = "ix_agendamento_paciente_cancelado", columnList = "paciente_id,cancelado_em")
})
public class Agendamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aula_id", nullable = false)
    private Aula aula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contratacao_credito_id")
    private ContratacaoPlano contratacaoCredito;

    @Column(nullable = false)
    private Instant criadoEm;

    @Column(name = "cancelado_em")
    private Instant canceladoEm;

    private Instant intencaoPresencaConfirmadaEm;

    @Column(nullable = false)
    private boolean sessaoDevolvida;

    protected Agendamento() {}

    Agendamento(Aula aula, Usuario paciente, Instant criadoEm, ContratacaoPlano contratacaoCredito) {
        this.aula = aula;
        this.paciente = paciente;
        this.criadoEm = criadoEm;
        this.contratacaoCredito = contratacaoCredito;
    }

    void cancelar(Instant agora, boolean devolverSessao) {
        canceladoEm = agora;
        sessaoDevolvida = devolverSessao;
    }

    void confirmarIntencaoPresenca(Instant agora) {
        if (intencaoPresencaConfirmadaEm == null) intencaoPresencaConfirmadaEm = agora;
    }

    ContratacaoPlano getContratacaoCredito() { return contratacaoCredito; }
    Long getId() { return id; }
    Aula getAula() { return aula; }
    Instant getCriadoEm() { return criadoEm; }
    Instant getCanceladoEm() { return canceladoEm; }
    Instant getIntencaoPresencaConfirmadaEm() { return intencaoPresencaConfirmadaEm; }
    boolean isSessaoDevolvida() { return sessaoDevolvida; }
}
