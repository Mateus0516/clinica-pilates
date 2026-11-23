package com.clinica.backend.agendamento;

import com.clinica.backend.notificacao.Notificacao.Evento;
import com.clinica.backend.notificacao.NotificacaoService;
import com.clinica.backend.notificacao.NotificacaoTransacao;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LembreteAula {
    private final AgendamentoRepository agendamentos;
    private final NotificacaoService notificacoes;
    private final NotificacaoTransacao transacao;
    private final Clock relogio;

    LembreteAula(AgendamentoRepository agendamentos, NotificacaoService notificacoes,
                  NotificacaoTransacao transacao, Clock relogio) {
        this.agendamentos = agendamentos;
        this.notificacoes = notificacoes;
        this.transacao = transacao;
        this.relogio = relogio;
    }

    @Scheduled(cron = "${timely.notificacoes.cron:0 */5 * * * *}", zone = "America/Sao_Paulo")
    public void enviar() {
        Instant agora = relogio.instant();
        Instant limite = agora.plus(Duration.ofHours(24));
        var fuso = AgendamentoConfig.FUSO_CLINICA;
        for (var candidato : agendamentos.candidatosLembrete(
                agora.atZone(fuso).toLocalDate(), limite.atZone(fuso).toLocalDate(), Evento.AULA_PROXIMA)) {
            transacao.porPaciente(candidato.getPacienteId(), paciente ->
                agendamentos.findByIdAndPacienteId(candidato.getOrigemId(), paciente.getId())
                    .filter(reserva -> reserva.getCanceladoEm() == null)
                    .ifPresent(reserva -> {
                        Aula aula = reserva.getAula();
                        Instant inicio = aula.getData().atTime(aula.getHorario()).atZone(fuso).toInstant();
                        Instant atual = relogio.instant();
                        if (inicio.isAfter(atual) && !inicio.isAfter(atual.plus(Duration.ofHours(24)))) {
                            notificacoes.registrar(paciente, Evento.AULA_PROXIMA, reserva.getId(),
                                    "Próxima aula", AgendamentoService.descreverAula(aula), atual);
                        }
                    }));
        }
    }
}
