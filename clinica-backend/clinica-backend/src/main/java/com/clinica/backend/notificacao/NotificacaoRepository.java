package com.clinica.backend.notificacao;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    boolean existsByPacienteIdAndEventoAndOrigemId(Long pacienteId, Notificacao.Evento evento, Long origemId);
    boolean existsByIdAndPacienteIdAndExcluidaEmIsNull(Long id, Long pacienteId);
    List<Notificacao> findByPacienteIdAndExcluidaEmIsNullOrderByCriadaEmDescIdDesc(Long pacienteId);
    long countByPacienteIdAndExcluidaEmIsNullAndLidaEmIsNull(Long pacienteId);

    @Modifying
    @Query("""
            update Notificacao n set n.lidaEm = :agora
            where n.paciente.id = :paciente and n.excluidaEm is null and n.lidaEm is null
              and (:id is null or n.id = :id)
            """)
    void marcar(Long paciente, Long id, Instant agora);

    @Modifying
    @Query("""
            update Notificacao n set n.excluidaEm = :agora
            where n.paciente.id = :paciente and n.excluidaEm is null
              and (:id is null or n.id = :id)
            """)
    int excluir(Long paciente, Long id, Instant agora);
}
