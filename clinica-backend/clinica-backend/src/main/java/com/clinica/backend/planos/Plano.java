package com.clinica.backend.planos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "planos")
public class Plano {
    @Id
    @Column(length = 40)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Column(nullable = false, length = 80)
    private String servico;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private int sessoes;

    @Column(nullable = false)
    private int meses;

    @Column(nullable = false)
    private boolean disponivel;

    @Column(length = 1000)
    private String beneficios;

    protected Plano() {}

    String getCodigo() { return codigo; }
    String getNome() { return nome; }
    String getDescricao() { return descricao; }
    String getServico() { return servico; }
    BigDecimal getValor() { return valor; }
    int getSessoes() { return sessoes; }
    int getMeses() { return meses; }
    String getBeneficios() { return beneficios; }
}
