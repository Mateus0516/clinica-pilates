package com.clinica.backend.agendamento;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestValueException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestController
@Tag(name = "Agendamento do paciente")
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(responseCode = "401", description = "Autenticação necessária")
@ApiResponse(responseCode = "403", description = "Acesso exclusivo para pacientes")
class AgendamentoController {
    private final AgendamentoService servico;

    AgendamentoController(AgendamentoService servico) {
        this.servico = servico;
    }

    @GetMapping("/aulas")
    @ApiResponse(responseCode = "200", description = "Consulta realizada")
    @Operation(summary = "Lista os horários futuros por período inclusivo de até 31 dias")
    @ApiResponse(responseCode = "400", description = "Período inválido")
    List<AgendamentoDto.Disponibilidade> aulas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return servico.consultarAulas(inicio, fim);
    }

    @GetMapping("/aulas/vagas")
    @ApiResponse(responseCode = "200", description = "Consulta realizada")
    @Operation(summary = "Consulta a capacidade e o número de vagas de um horário")
    @ApiResponse(responseCode = "400", description = "Data ou horário inválido")
    @ApiResponse(responseCode = "404", description = "Instrutor inexistente")
    AgendamentoDto.Disponibilidade vagas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horario,
            @RequestParam String instrutorCodigo) {
        return servico.consultarVagas(data, horario, instrutorCodigo);
    }

    @PostMapping("/agendamentos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Reserva uma aula e desconta uma sessão")
    @ApiResponse(responseCode = "201", description = "Reserva criada")
    @ApiResponse(responseCode = "400", description = "Data ou horário inválido")
    @ApiResponse(responseCode = "404", description = "Instrutor inexistente")
    @ApiResponse(responseCode = "409", description = "Sem vaga, sem saldo ou já existe reserva para o dia")
    @ApiResponse(responseCode = "422", description = "A aula já passou ou começou")
    AgendamentoDto.Agendamento reservar(Principal paciente, @RequestBody AgendamentoDto.Reserva pedido) {
        return servico.reservar(paciente.getName(), pedido);
    }

    @GetMapping("/agendamentos")
    @ApiResponse(responseCode = "200", description = "Consulta realizada")
    @Operation(summary = "Lista os agendamentos futuros do paciente autenticado")
    List<AgendamentoDto.Agendamento> reservas(Principal paciente) {
        return servico.consultarReservas(paciente.getName(), false);
    }

    @PostMapping("/agendamentos/{id}/cancelamento")
    @ApiResponse(responseCode = "200", description = "Reserva cancelada")
    @Operation(summary = "Cancela uma reserva própria e devolve a sessão com pelo menos seis horas de antecedência")
    @ApiResponse(responseCode = "404", description = "Reserva não encontrada")
    @ApiResponse(responseCode = "409", description = "A reserva já foi cancelada ou a aula começou")
    AgendamentoDto.Agendamento cancelar(Principal paciente, @PathVariable Long id) {
        return servico.cancelar(paciente.getName(), id);
    }

    @PutMapping("/agendamentos/{id}/intencao-presenca")
    @ApiResponse(responseCode = "200", description = "Intenção confirmada")
    @Operation(summary = "Confirma a intenção de comparecer, sem registrar comparecimento profissional")
    @ApiResponse(responseCode = "404", description = "Reserva não encontrada")
    @ApiResponse(responseCode = "409", description = "A reserva já foi cancelada ou a aula começou")
    AgendamentoDto.Agendamento confirmar(Principal paciente, @PathVariable Long id) {
        return servico.confirmarIntencao(paciente.getName(), id);
    }

    @GetMapping("/agendamentos/historico")
    @ApiResponse(responseCode = "200", description = "Consulta realizada")
    @Operation(summary = "Lista as aulas encerradas e as reservas canceladas do paciente")
    List<AgendamentoDto.Agendamento> historico(Principal paciente) {
        return servico.consultarReservas(paciente.getName(), true);
    }

    @GetMapping("/sessoes/saldo")
    @ApiResponse(responseCode = "200", description = "Consulta realizada")
    @Operation(summary = "Consulta o saldo de sessões do paciente autenticado")
    AgendamentoDto.Saldo saldo(Principal paciente) {
        return servico.consultarSaldo(paciente.getName());
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, String>> erroDeNegocio(ResponseStatusException erro) {
        return ResponseEntity.status(erro.getStatusCode()).body(Map.of("erro", erro.getReason()));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MissingRequestValueException.class,
            MethodArgumentTypeMismatchException.class})
    ResponseEntity<Map<String, String>> erroDeRequisicao() {
        return ResponseEntity.badRequest().body(Map.of("erro", "Confira os parâmetros e o formato da requisição."));
    }
}
