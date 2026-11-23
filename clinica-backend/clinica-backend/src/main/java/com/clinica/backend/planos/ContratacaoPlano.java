package com.clinica.backend.planos;

import com.clinica.backend.model.Usuario;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "contratacoes_plano", indexes =
        @Index(name = "ix_contratacao_paciente", columnList = "paciente_id,contratado_em"), uniqueConstraints = @UniqueConstraint(
        name = "uk_contratacao_pedido", columnNames = {"paciente_id", "chave_pedido"}))
public class ContratacaoPlano {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plano_codigo", nullable = false)
    private Plano plano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renovacao_de_id", unique = true)
    private ContratacaoPlano renovacaoDe;

    @Column(name = "contratado_em", nullable = false)
    private Instant contratadoEm;

    private LocalDate inicio;
    private LocalDate vencimento;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorContratado;

    @Column(nullable = false)
    private int sessoesContratadas;

    @Column(nullable = false)
    private int mesesContratados;

    @Column(name = "chave_pedido", nullable = false, length = 36)
    private String chavePedido;

    @Column(nullable = false, length = 100)
    private String nomeContratado;
    @Column(nullable = false, length = 255)
    private String descricaoContratada;
    @Column(nullable = false, length = 80)
    private String servicoContratado;
    @Column(length = 1000)
    private String beneficiosContratados;

    @Column(nullable = false)
    private int sessoesRestantes;

    protected ContratacaoPlano() {}

    ContratacaoPlano(Usuario paciente, Plano plano, ContratacaoPlano renovacaoDe, Instant instante, String chavePedido) {
        this.paciente = paciente;
        this.plano = plano;
        this.renovacaoDe = renovacaoDe;
        this.contratadoEm = instante;
        this.chavePedido = chavePedido;
        this.nomeContratado = plano.getNome();
        this.descricaoContratada = plano.getDescricao();
        this.servicoContratado = plano.getServico();
        this.beneficiosContratados = plano.getBeneficios();
        this.valorContratado = plano.getValor();
        this.sessoesContratadas = plano.getSessoes();
        this.mesesContratados = plano.getMeses();
    }

    void ativar(LocalDate data) {
        inicio = data;
        vencimento = data.plusMonths(mesesContratados);
        sessoesRestantes = sessoesContratadas;
    }

    void consumirCredito() { sessoesRestantes--; }
    void devolverCredito() { sessoesRestantes++; }

    Long getId() { return id; }
    Plano getPlano() { return plano; }
    Instant getContratadoEm() { return contratadoEm; }
    LocalDate getInicio() { return inicio; }
    LocalDate getVencimento() { return vencimento; }
    BigDecimal getValorContratado() { return valorContratado; }
    int getSessoesContratadas() { return sessoesContratadas; }
    int getMesesContratados() { return mesesContratados; }
    Long getRenovacaoDeId() { return renovacaoDe == null ? null : renovacaoDe.getId(); }
    String getNomeContratado() { return nomeContratado; }
    String getDescricaoContratada() { return descricaoContratada; }
    String getServicoContratado() { return servicoContratado; }
    String getBeneficiosContratados() { return beneficiosContratados; }
    int getSessoesRestantes() { return sessoesRestantes; }
}
