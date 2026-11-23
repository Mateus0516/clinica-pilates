package com.clinica.backend.planos;

import com.clinica.backend.notificacao.CandidatoNotificacao;
import com.clinica.backend.notificacao.Notificacao.Evento;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

interface ContratacaoPlanoRepository extends JpaRepository<ContratacaoPlano, Long> {
    @EntityGraph(attributePaths = "plano")
    List<ContratacaoPlano> findByPacienteIdOrderByContratadoEmDescIdDesc(Long pacienteId);

    Optional<ContratacaoPlano> findByPacienteIdAndChavePedido(Long pacienteId, String chavePedido);
    List<ContratacaoPlano> findByPacienteIdAndSessoesRestantesGreaterThanOrderByInicioAscIdAsc(Long pacienteId, int minimo);

    @EntityGraph(attributePaths = "plano")
    Optional<ContratacaoPlano> findByIdAndPacienteId(Long id, Long pacienteId);

    Optional<ContratacaoPlano> findFirstByPacienteIdAndInicioIsNotNullOrderByIdDesc(Long pacienteId);

    @Query("""
            select c.paciente.id as pacienteId, c.id as origemId from ContratacaoPlano c
            where c.inicio is not null and c.paciente.perfil = 'PACIENTE'
              and (:vencido = true and c.vencimento <= :limite
                   or :vencido = false and c.vencimento > :hoje and c.vencimento <= :limite)
              and not exists (select posterior.id from ContratacaoPlano posterior where posterior.paciente = c.paciente
                          and posterior.inicio is not null and posterior.id > c.id)
              and not exists (select n.id from Notificacao n where n.paciente = c.paciente
                              and n.origemId = c.id and n.evento = :evento)
            """)
    List<CandidatoNotificacao> candidatosVencimento(LocalDate hoje, LocalDate limite, boolean vencido, Evento evento);
}
