package com.clinica.backend.planos;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "pagamentos_plano")
public class PagamentoPlano {
    public enum Forma { PIX, CARTAO_CREDITO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contratacao_id", nullable = false, unique = true)
    private ContratacaoPlano contratacao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private Instant criadoEm;

    private LocalDate vencimento;

    private Instant pagoEm;

    @Enumerated(EnumType.STRING)
    private Forma forma;

    protected PagamentoPlano() {}

    PagamentoPlano(ContratacaoPlano contratacao, Instant criadoEm, LocalDate vencimento) {
        this.contratacao = contratacao;
        this.valor = contratacao.getValorContratado();
        this.criadoEm = criadoEm;
        this.vencimento = vencimento;
    }

    void registrarSimulacao(Instant instante, Forma forma) {
        pagoEm = instante;
        this.forma = forma;
    }

    Long getId() { return id; }
    ContratacaoPlano getContratacao() { return contratacao; }
    BigDecimal getValor() { return valor; }
    Instant getCriadoEm() { return criadoEm; }
    LocalDate getVencimento() { return vencimento; }
    Instant getPagoEm() { return pagoEm; }
    Forma getForma() { return forma; }
}
