package com.clinica.backend.planos;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

interface PagamentoPlanoRepository extends JpaRepository<PagamentoPlano, Long> {
    Optional<PagamentoPlano> findByContratacaoId(Long id);
    @EntityGraph(attributePaths = {"contratacao", "contratacao.plano"})
    List<PagamentoPlano> findByContratacaoPacienteIdOrderByCriadoEmDescIdDesc(Long pacienteId);

    @EntityGraph(attributePaths = {"contratacao", "contratacao.plano"})
    Optional<PagamentoPlano> findByIdAndContratacaoPacienteId(Long id, Long pacienteId);
}
