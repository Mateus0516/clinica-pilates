package com.clinica.backend.agendamento;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface InstrutorRepository extends JpaRepository<Instrutor, String> {
    List<Instrutor> findAllByOrderByCodigoAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Instrutor i where i.codigo = :codigo")
    Optional<Instrutor> bloquear(@Param("codigo") String codigo);
}
