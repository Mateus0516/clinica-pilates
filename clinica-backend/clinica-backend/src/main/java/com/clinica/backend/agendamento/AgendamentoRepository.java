package com.clinica.backend.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    boolean existsByPacienteIdAndAulaDataAndCanceladoEmIsNull(Long pacienteId, LocalDate data);

    long countByAulaIdAndCanceladoEmIsNull(Long aulaId);

    @EntityGraph(attributePaths = {"aula", "aula.instrutor"})
    Optional<Agendamento> findByIdAndPacienteId(Long id, Long pacienteId);

    @EntityGraph(attributePaths = {"aula", "aula.instrutor"})
    List<Agendamento> findByPacienteId(Long pacienteId);

    @Query("""
            select a.data as data, a.horario as horario, a.instrutor.codigo as instrutor,
                   count(r.id) as reservas
            from Agendamento r join r.aula a
            where r.canceladoEm is null and a.data between :inicio and :fim
            group by a.data, a.horario, a.instrutor.codigo
            """)
    List<Ocupacao> contarPorHorario(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    interface Ocupacao {
        LocalDate getData();
        LocalTime getHorario();
        String getInstrutor();
        long getReservas();
    }
}
