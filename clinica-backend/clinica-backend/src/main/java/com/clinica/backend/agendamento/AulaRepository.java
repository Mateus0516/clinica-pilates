package com.clinica.backend.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface AulaRepository extends JpaRepository<Aula, Long> {
    Optional<Aula> findByDataAndHorarioAndInstrutorCodigo(LocalDate data, LocalTime horario, String codigo);
}
