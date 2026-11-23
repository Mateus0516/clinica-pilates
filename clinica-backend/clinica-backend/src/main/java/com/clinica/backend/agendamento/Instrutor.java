package com.clinica.backend.agendamento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "instrutores")
public class Instrutor {
    @Id
    @Column(length = 30)
    private String codigo;

    @Column(nullable = false, length = 80)
    private String nome;

    protected Instrutor() {}

    Instrutor(String codigo, String nome) {
        this.codigo = codigo;
        this.nome = nome;
    }

    String getCodigo() { return codigo; }
    String getNome() { return nome; }
}
