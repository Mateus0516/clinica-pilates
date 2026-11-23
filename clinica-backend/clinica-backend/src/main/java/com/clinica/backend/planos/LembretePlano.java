package com.clinica.backend.planos;

import com.clinica.backend.notificacao.Notificacao.Evento;
import com.clinica.backend.notificacao.NotificacaoService;
import com.clinica.backend.notificacao.NotificacaoTransacao;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LembretePlano {
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    private static final LocalTime HORARIO = LocalTime.of(9, 0);
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ContratacaoPlanoRepository contratos;
    private final NotificacaoService notificacoes;
    private final NotificacaoTransacao transacao;
    private final Clock relogio;

    LembretePlano(ContratacaoPlanoRepository contratos, NotificacaoService notificacoes,
                   NotificacaoTransacao transacao, Clock relogio) {
        this.contratos = contratos;
        this.notificacoes = notificacoes;
        this.transacao = transacao;
        this.relogio = relogio;
    }

    @Scheduled(cron = "${timely.notificacoes.cron:0 */5 * * * *}", zone = "America/Sao_Paulo")
    public void enviar() {
        ZonedDateTime agora = relogio.instant().atZone(FUSO);
        LocalDate hoje = agora.toLocalDate();
        boolean antesDasNove = agora.toLocalTime().isBefore(HORARIO);
        enviar(hoje, hoje.plusDays(antesDasNove ? 2 : 3), false, Evento.PLANO_A_VENCER);
        enviar(hoje, antesDasNove ? hoje.minusDays(1) : hoje, true, Evento.PLANO_VENCIDO);
    }

    private void enviar(LocalDate hoje, LocalDate limite, boolean vencido, Evento evento) {
        for (var candidato : contratos.candidatosVencimento(hoje, limite, vencido, evento)) {
            transacao.porPaciente(candidato.getPacienteId(), paciente ->
                contratos.findFirstByPacienteIdAndInicioIsNotNullOrderByIdDesc(paciente.getId())
                    .filter(contrato -> contrato.getId().equals(candidato.getOrigemId()))
                    .ifPresent(contrato -> {
                        ZonedDateTime agora = relogio.instant().atZone(FUSO);
                        LocalDate fim = contrato.getVencimento();
                        ZonedDateTime inicioJanela = fim.minusDays(vencido ? 0 : 3).atTime(HORARIO).atZone(FUSO);
                        if (agora.isBefore(inicioJanela) || (!vencido && !agora.toLocalDate().isBefore(fim))) return;
                        String titulo = vencido ? "Plano vencido" : "Plano próximo do vencimento";
                        String mensagem = contrato.getNomeContratado() + (vencido ? " venceu em " : " vence em ")
                                + fim.format(DATA) + ".";
                        notificacoes.registrar(paciente, evento, contrato.getId(), titulo, mensagem, agora.toInstant());
                    }));
        }
    }
}
