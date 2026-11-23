package com.clinica.backend.agendamento;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.planos.CreditosPlanoService;
import com.clinica.backend.planos.ContratacaoPlano;
import com.clinica.backend.repository.UsuarioRepository;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static com.clinica.backend.agendamento.AgendamentoConfig.FUSO_CLINICA;

@Service
@Transactional(readOnly = true)
class AgendamentoService {
    // Provisório até a integração com os planos da clínica.
    private static final int CAPACIDADE = 3;
    private static final Duration ANTECEDENCIA_REEMBOLSO = Duration.ofHours(6);
    private static final List<LocalTime> HORARIOS = List.of(7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19)
            .stream().map(hora -> LocalTime.of(hora, 0)).toList();

    private final UsuarioRepository usuarios;
    private final InstrutorRepository instrutores;
    private final AulaRepository aulas;
    private final AgendamentoRepository agendamentos;
    private final SaldoSessoesService saldos;
    private final CreditosPlanoService creditosPlano;
    private final Clock relogio;

    AgendamentoService(UsuarioRepository usuarios, InstrutorRepository instrutores, AulaRepository aulas,
                       AgendamentoRepository agendamentos, SaldoSessoesService saldos, CreditosPlanoService creditosPlano, Clock relogio) {
        this.usuarios = usuarios;
        this.instrutores = instrutores;
        this.aulas = aulas;
        this.agendamentos = agendamentos;
        this.saldos = saldos;
        this.creditosPlano = creditosPlano;
        this.relogio = relogio;
    }

    public List<AgendamentoDto.Disponibilidade> consultarAulas(LocalDate inicio, LocalDate fim) {
        if (!dataValida(inicio) || !dataValida(fim) || fim.isBefore(inicio)
                || ChronoUnit.DAYS.between(inicio, fim) >= 31) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um período de até 31 dias.");
        }

        Instant agora = relogio.instant();
        Map<Horario, Long> ocupacao = ocupacao(inicio, fim);
        List<Instrutor> catalogo = instrutores.findAllByOrderByCodigoAsc();
        return inicio.datesUntil(fim.plusDays(1))
                .filter(data -> data.getDayOfWeek() != DayOfWeek.SUNDAY)
                .flatMap(data -> HORARIOS.stream().filter(hora -> inicioAula(data, hora).isAfter(agora))
                        .flatMap(hora -> catalogo.stream().map(instrutor ->
                                disponibilidade(data, hora, instrutor, ocupacao))))
                .toList();
    }

    public AgendamentoDto.Disponibilidade consultarVagas(LocalDate data, LocalTime horario, String codigo) {
        validarHorario(data, horario, codigo);
        Instrutor instrutor = instrutores.findById(codigo).orElseThrow(() -> naoEncontrado("Instrutor"));
        if (!inicioAula(data, horario).isAfter(relogio.instant())) {
            return new AgendamentoDto.Disponibilidade(data, horario, codigo, instrutor.getNome(), CAPACIDADE, 0);
        }
        return disponibilidade(data, horario, instrutor, ocupacao(data, data));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AgendamentoDto.Agendamento reservar(Long pacienteId, AgendamentoDto.Reserva pedido) {
        validarHorario(pedido.data(), pedido.horario(), pedido.instrutorCodigo());
        Usuario paciente = bloquearPaciente(pacienteId);
        // A linha do instrutor também protege a primeira reserva, antes de a ocorrência existir.
        Instrutor instrutor = bloquearInstrutor(pedido.instrutorCodigo());
        Instant agora = relogio.instant();
        if (!inicioAula(pedido.data(), pedido.horario()).isAfter(agora)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "O horário já passou ou começou.");
        }
        if (agendamentos.existsByPacienteIdAndAulaDataAndCanceladoEmIsNull(paciente.getId(), pedido.data())) {
            throw conflito("Você já tem um agendamento neste dia.");
        }

        SaldoSessoes saldo = saldos.obterParaAlterar(paciente);
        if (saldo.getDisponiveis() <= 0) throw conflito("Saldo de sessões insuficiente.");

        Aula aula = aulas.findByDataAndHorarioAndInstrutorCodigo(pedido.data(), pedido.horario(), instrutor.getCodigo())
                .orElseGet(() -> aulas.save(new Aula(pedido.data(), pedido.horario(), instrutor)));
        if (agendamentos.countByAulaIdAndCanceladoEmIsNull(aula.getId()) >= CAPACIDADE) {
            throw conflito("Não há vagas para esta aula.");
        }

        ContratacaoPlano origem = creditosPlano.consumir(pacienteId, saldo.getDisponiveis());
        saldo.descontar();
        return resposta(agendamentos.save(new Agendamento(aula, paciente, agora, origem)), agora);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AgendamentoDto.Agendamento cancelar(Long pacienteId, Long id) {
        Usuario paciente = bloquearPaciente(pacienteId);
        Agendamento reserva = buscarReserva(paciente, id);
        Aula aula = reserva.getAula();
        bloquearInstrutor(aula.getInstrutor().getCodigo());
        Instant agora = relogio.instant();
        Instant inicio = exigirReservaFutura(reserva, agora);
        boolean devolver = Duration.between(agora, inicio).compareTo(ANTECEDENCIA_REEMBOLSO) >= 0;
        if (devolver) {
            saldos.obterParaAlterar(paciente).devolver();
            creditosPlano.devolver(reserva.getContratacaoCredito());
        }
        reserva.cancelar(agora, devolver);
        return resposta(reserva, agora);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AgendamentoDto.Agendamento confirmarIntencao(Long pacienteId, Long id) {
        Agendamento reserva = buscarReserva(bloquearPaciente(pacienteId), id);
        Instant agora = relogio.instant();
        exigirReservaFutura(reserva, agora);
        reserva.confirmarIntencaoPresenca(agora);
        return resposta(reserva, agora);
    }

    public List<AgendamentoDto.Agendamento> consultarReservas(Long pacienteId, boolean historico) {
        Instant agora = relogio.instant();
        var ordem = Comparator.comparing(AgendamentoDto.Agendamento::data)
                .thenComparing(AgendamentoDto.Agendamento::horario)
                .thenComparing(AgendamentoDto.Agendamento::id);
        return agendamentos.findByPacienteId(pacienteId).stream()
                .map(reserva -> resposta(reserva, agora))
                .filter(reserva -> historico == (reserva.status() != AgendamentoDto.Status.AGENDADO))
                .sorted(historico ? ordem.reversed() : ordem)
                .toList();
    }

    public AgendamentoDto.Saldo consultarSaldo(Long pacienteId) {
        return new AgendamentoDto.Saldo(saldos.consultar(pacienteId));
    }

    private Map<Horario, Long> ocupacao(LocalDate inicio, LocalDate fim) {
        Map<Horario, Long> vagas = new HashMap<>();
        for (var linha : agendamentos.contarPorHorario(inicio, fim)) {
            vagas.put(new Horario(linha.getData(), linha.getHorario(), linha.getInstrutor()), linha.getReservas());
        }
        return vagas;
    }

    private AgendamentoDto.Disponibilidade disponibilidade(
            LocalDate data, LocalTime hora, Instrutor instrutor, Map<Horario, Long> ocupacao) {
        long reservas = ocupacao.getOrDefault(new Horario(data, hora, instrutor.getCodigo()), 0L);
        return new AgendamentoDto.Disponibilidade(data, hora, instrutor.getCodigo(), instrutor.getNome(),
                CAPACIDADE, (int) Math.max(0, CAPACIDADE - reservas));
    }

    private void validarHorario(LocalDate data, LocalTime horario, String codigo) {
        if (!dataValida(data) || data.getDayOfWeek() == DayOfWeek.SUNDAY
                || horario == null || !HORARIOS.contains(horario) || codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma aula e um horário válidos de segunda a sábado.");
        }
    }

    private static boolean dataValida(LocalDate data) {
        return data != null && data.getYear() >= 1000 && data.getYear() <= 9999;
    }

    private Usuario bloquearPaciente(Long pacienteId) {
        Usuario paciente = usuarios.bloquearPorId(pacienteId).orElseThrow(() -> naoEncontrado("Paciente"));
        if (!"PACIENTE".equals(paciente.getPerfil())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso exclusivo para pacientes.");
        }
        return paciente;
    }

    private Instrutor bloquearInstrutor(String codigo) {
        return instrutores.bloquear(codigo).orElseThrow(() -> naoEncontrado("Instrutor"));
    }

    private Agendamento buscarReserva(Usuario paciente, Long id) {
        return agendamentos.findByIdAndPacienteId(id, paciente.getId())
                .orElseThrow(() -> naoEncontrado("Agendamento"));
    }

    private Instant exigirReservaFutura(Agendamento agendamento, Instant agora) {
        if (agendamento.getCanceladoEm() != null) throw conflito("O agendamento já foi cancelado.");
        Aula aula = agendamento.getAula();
        Instant inicio = inicioAula(aula.getData(), aula.getHorario());
        if (!inicio.isAfter(agora)) throw conflito("A aula já passou ou começou.");
        return inicio;
    }

    private static Instant inicioAula(LocalDate data, LocalTime horario) {
        return data.atTime(horario).atZone(FUSO_CLINICA).toInstant();
    }

    private AgendamentoDto.Agendamento resposta(Agendamento agendamento, Instant agora) {
        Aula aula = agendamento.getAula();
        AgendamentoDto.Status status = AgendamentoDto.Status.AGENDADO;
        if (agendamento.getCanceladoEm() != null) {
            status = AgendamentoDto.Status.CANCELADO;
        } else if (!inicioAula(aula.getData(), aula.getHorario()).isAfter(agora)) {
            status = AgendamentoDto.Status.ENCERRADO;
        }
        return new AgendamentoDto.Agendamento(agendamento.getId(), aula.getData(), aula.getHorario(),
                aula.getInstrutor().getCodigo(), aula.getInstrutor().getNome(), status, agendamento.getCriadoEm(),
                agendamento.getCanceladoEm(), agendamento.getIntencaoPresencaConfirmadaEm(),
                agendamento.isSessaoDevolvida());
    }

    private static ResponseStatusException conflito(String motivo) {
        return new ResponseStatusException(HttpStatus.CONFLICT, motivo);
    }

    private static ResponseStatusException naoEncontrado(String recurso) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, recurso + " não encontrado.");
    }

    private record Horario(LocalDate data, LocalTime hora, String instrutor) {}
}
