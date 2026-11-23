package com.clinica.backend.planos;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface PlanoRepository extends JpaRepository<Plano, String> {
    List<Plano> findByDisponivelTrueOrderByNomeAsc();
    Optional<Plano> findByCodigoAndDisponivelTrue(String codigo);
}
