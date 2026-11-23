package com.clinica.backend.planos;

import java.util.List;
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
}
