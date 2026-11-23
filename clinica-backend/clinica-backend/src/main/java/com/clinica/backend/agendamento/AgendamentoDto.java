package com.clinica.backend.agendamento;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class AgendamentoDto {
    private AgendamentoDto() {}

    public record Reserva(
            @Schema(example = "2027-01-04") LocalDate data,
            @Schema(type = "string", example = "09:00") LocalTime horario,
            @Schema(example = "ana") String instrutorCodigo) {}

    public record Disponibilidade(
            LocalDate data,
            @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "09:00") LocalTime horario,
            String instrutorCodigo, String instrutor, int capacidade, int vagasDisponiveis) {}

    public enum Status { AGENDADO, CANCELADO, ENCERRADO }

    public record Agendamento(
            Long id, LocalDate data,
            @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "09:00") LocalTime horario,
            String instrutorCodigo, String instrutor, Status status, Instant criadoEm, Instant canceladoEm,
            @Schema(description = "Autodeclaração do paciente, sem registro de comparecimento")
            Instant intencaoPresencaConfirmadaEm,
            boolean sessaoDevolvida) {}

    public record Saldo(int sessoesDisponiveis) {}
}
