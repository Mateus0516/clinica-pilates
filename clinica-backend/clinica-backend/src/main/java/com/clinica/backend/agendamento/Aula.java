package com.clinica.backend.agendamento;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "aulas", uniqueConstraints = @UniqueConstraint(
        name = "uk_aulas_horario_instrutor", columnNames = {"data_aula", "horario", "instrutor_codigo"}))
public class Aula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_aula", nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime horario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "instrutor_codigo", nullable = false)
    private Instrutor instrutor;

    protected Aula() {}

    Aula(LocalDate data, LocalTime horario, Instrutor instrutor) {
        this.data = data;
        this.horario = horario;
        this.instrutor = instrutor;
    }

    Long getId() { return id; }
    LocalDate getData() { return data; }
    LocalTime getHorario() { return horario; }
    Instrutor getInstrutor() { return instrutor; }
}
