package com.clinica.backend.planos;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(propagation = Propagation.MANDATORY)
public class CreditosPlanoService {
    private final ContratacaoPlanoRepository contratacoes;

    CreditosPlanoService(ContratacaoPlanoRepository contratacoes) {
        this.contratacoes = contratacoes;
    }

    // O mesmo bloqueio do paciente protege o saldo geral e os créditos de cada contratação.
    public ContratacaoPlano consumir(Long paciente, int saldoAntesDoDebito) {
        var lotes = contratacoes.findByPacienteIdAndSessoesRestantesGreaterThanOrderByInicioAscIdAsc(paciente, 0);
        int saldoDosPlanos = lotes.stream().mapToInt(ContratacaoPlano::getSessoesRestantes).sum();
        if (saldoAntesDoDebito > saldoDosPlanos || lotes.isEmpty()) return null;
        ContratacaoPlano maisAntiga = lotes.get(0);
        maisAntiga.consumirCredito();
        return maisAntiga;
    }

    public void devolver(ContratacaoPlano origem) {
        if (origem != null) origem.devolverCredito();
    }
}
