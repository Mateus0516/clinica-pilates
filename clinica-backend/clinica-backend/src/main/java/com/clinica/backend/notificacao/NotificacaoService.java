package com.clinica.backend.notificacao;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.notificacao.Notificacao.Evento;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificacaoService {
    private final NotificacaoRepository repositorio;
    private final Clock relogio;

    NotificacaoService(NotificacaoRepository repositorio, Clock relogio) {
        this.repositorio = repositorio;
        this.relogio = relogio;
    }

    // Os produtores mantêm o bloqueio do paciente e a mesma transação do evento.
    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(Usuario paciente, Evento evento, Long origem, String titulo, String mensagem, Instant agora) {
        if (repositorio.existsByPacienteIdAndEventoAndOrigemId(paciente.getId(), evento, origem)) return;
        repositorio.save(new Notificacao(paciente, evento, origem, titulo, mensagem, agora));
    }

    @Transactional(readOnly = true)
    public List<NotificacaoDto> listar(Long paciente) {
        return repositorio.findByPacienteIdAndExcluidaEmIsNullOrderByCriadaEmDescIdDesc(paciente)
                .stream().map(Notificacao::dto).toList();
    }

    @Transactional(readOnly = true)
    public long naoLidas(Long paciente) {
        return repositorio.countByPacienteIdAndExcluidaEmIsNullAndLidaEmIsNull(paciente);
    }

    @Transactional
    public void marcar(Long paciente, Long id) {
        if (id != null && !repositorio.existsByIdAndPacienteIdAndExcluidaEmIsNull(id, paciente)) {
            throw naoEncontrada();
        }
        repositorio.marcar(paciente, id, relogio.instant());
    }

    @Transactional
    public void excluir(Long paciente, Long id) {
        if (repositorio.excluir(paciente, id, relogio.instant()) == 0 && id != null) throw naoEncontrada();
    }

    private ResponseStatusException naoEncontrada() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada.");
    }
}
