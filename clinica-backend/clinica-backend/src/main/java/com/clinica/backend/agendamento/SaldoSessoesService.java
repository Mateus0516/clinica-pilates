package com.clinica.backend.agendamento;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SaldoSessoesService {
    private final SaldoSessoesRepository saldos;
    private final UsuarioRepository usuarios;

    SaldoSessoesService(SaldoSessoesRepository saldos, UsuarioRepository usuarios) {
        this.saldos = saldos;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public int consultar(Long id) {
        return saldos.findById(id).map(SaldoSessoes::getDisponiveis)
                .orElseGet(() -> saldoInicial(usuarios.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado."))));
    }

    // O chamador mantém o bloqueio pessimista do paciente até o commit.
    @Transactional(propagation = Propagation.MANDATORY)
    public void creditar(Usuario paciente, int sessoes) {
        obterParaAlterar(paciente).creditar(sessoes);
    }

    SaldoSessoes obterParaAlterar(Usuario paciente) {
        return saldos.findById(paciente.getId())
                .orElseGet(() -> saldos.save(new SaldoSessoes(paciente, saldoInicial(paciente))));
    }

    private int saldoInicial(Usuario paciente) {
        return paciente.temSaldoLegado() ? 8 : 0;
    }
}
