package com.clinica.backend.agendamento;

import com.clinica.backend.model.Usuario;
import jakarta.persistence.*;

@Entity
@Table(name = "saldos_sessoes")
public class SaldoSessoes {
    @Id
    private Long pacienteId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @Column(nullable = false)
    private int disponiveis;

    protected SaldoSessoes() {}

    SaldoSessoes(Usuario paciente, int disponiveis) {
        this.paciente = paciente;
        this.disponiveis = disponiveis;
    }

    int getDisponiveis() { return disponiveis; }
    void descontar() { disponiveis--; }
    void devolver() { disponiveis++; }
    void creditar(int sessoes) { disponiveis = Math.addExact(disponiveis, sessoes); }
}
