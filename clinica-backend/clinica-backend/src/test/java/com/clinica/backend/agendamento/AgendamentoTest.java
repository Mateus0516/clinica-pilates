package com.clinica.backend.agendamento;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static com.clinica.backend.agendamento.AgendamentoConfig.FUSO_CLINICA;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AgendamentoTest {
    private static final LocalTime HORA = LocalTime.of(9, 0);
    private static final LocalDate SEGUNDA = LocalDate.of(2027, 1, 4);

    @Autowired AgendamentoService servico;
    @Autowired UsuarioRepository usuarios;
    @Autowired JwtService jwt;
    @Autowired MockMvc mvc;
    @MockBean Clock relogio;

    @BeforeEach
    void configurarRelogio() {
        agora(inicio(SEGUNDA).minus(Duration.ofHours(24)));
    }

    @Test
    void agendaComSucessoEDescontaSessao() {
        String paciente = paciente();
        var pedido = pedido(SEGUNDA);
        assertEquals(8, servico.consultarSaldo(paciente).sessoesDisponiveis());

        var reserva = servico.reservar(paciente, pedido);
        assertEquals(AgendamentoDto.Status.AGENDADO, reserva.status());
        assertEquals(7, servico.consultarSaldo(paciente).sessoesDisponiveis());
        assertEquals(2, servico.consultarVagas(SEGUNDA, HORA, "ana").vagasDisponiveis());
        assertEquals(List.of(reserva.id()), servico.consultarReservas(paciente, false)
                .stream().map(AgendamentoDto.Agendamento::id).toList());
    }

    @Test
    void recusaAulaSemVagasSemDescontarSaldo() {
        LocalDate data = SEGUNDA.plusDays(1);
        for (int i = 0; i < 3; i++) servico.reservar(paciente(), pedido(data));
        String quartoPaciente = paciente();

        erro(HttpStatus.CONFLICT, "Não há vagas para esta aula.",
                () -> servico.reservar(quartoPaciente, pedido(data)));
        assertEquals(8, servico.consultarSaldo(quartoPaciente).sessoesDisponiveis());
    }

    @Test
    void recusaDuplicidadeInclusiveEmOutroHorarioEInstrutor() {
        String paciente = paciente();
        LocalDate data = SEGUNDA.plusDays(2);
        servico.reservar(paciente, pedido(data));

        erro(HttpStatus.CONFLICT, "Você já tem um agendamento neste dia.",
                () -> servico.reservar(paciente, pedido(data)));
        erro(HttpStatus.CONFLICT, "Você já tem um agendamento neste dia.",
                () -> servico.reservar(paciente, new AgendamentoDto.Reserva(data, HORA.plusHours(1), "bruno")));
        assertEquals(7, servico.consultarSaldo(paciente).sessoesDisponiveis());
    }

    @Test
    void recusaReservaSemSaldo() {
        String paciente = paciente();
        LocalDate data = SEGUNDA.plusWeeks(2);
        for (int i = 0; i < 8; i++) servico.reservar(paciente, pedido(data.plusWeeks(i)));

        assertEquals(0, servico.consultarSaldo(paciente).sessoesDisponiveis());
        erro(HttpStatus.CONFLICT, "Saldo de sessões insuficiente.",
                () -> servico.reservar(paciente, pedido(data.plusWeeks(8))));
    }

    @Test
    void impedeReservaNoInicioOuDepoisDaAulaNoFusoDaClinica() {
        String paciente = paciente();
        agora(inicio(SEGUNDA));
        erro(HttpStatus.UNPROCESSABLE_ENTITY, "O horário já passou ou começou.",
                () -> servico.reservar(paciente, pedido(SEGUNDA)));
        agora(inicio(SEGUNDA).plusSeconds(1));
        erro(HttpStatus.UNPROCESSABLE_ENTITY, "O horário já passou ou começou.",
                () -> servico.reservar(paciente, pedido(SEGUNDA)));
    }

    @Test
    void devolveSessaoComExatamenteSeisHorasELiberaVaga() {
        String paciente = paciente();
        LocalDate data = SEGUNDA.plusDays(3);
        var reserva = servico.reservar(paciente, pedido(data));
        agora(inicio(data).minus(Duration.ofHours(6)));

        var cancelado = servico.cancelar(paciente, reserva.id());
        assertTrue(cancelado.sessaoDevolvida());
        assertEquals(AgendamentoDto.Status.CANCELADO, cancelado.status());
        assertEquals(8, servico.consultarSaldo(paciente).sessoesDisponiveis());
        assertEquals(3, servico.consultarVagas(data, HORA, "ana").vagasDisponiveis());
        assertEquals(reserva.id(), servico.consultarReservas(paciente, true).get(0).id());
        assertTrue(servico.consultarReservas(paciente, false).isEmpty());
        assertNotEquals(reserva.id(), servico.reservar(paciente, pedido(data)).id());
    }

    @Test
    void naoDevolveSessaoComMenosDeSeisHoras() {
        String paciente = paciente();
        LocalDate data = SEGUNDA.plusDays(4);
        var reserva = servico.reservar(paciente, pedido(data));
        agora(inicio(data).minus(Duration.ofHours(6)).plusSeconds(1));

        assertFalse(servico.cancelar(paciente, reserva.id()).sessaoDevolvida());
        assertEquals(7, servico.consultarSaldo(paciente).sessoesDisponiveis());
    }

    @Test
    void impedeCancelamentoRepetidoEDevolucaoDuplicada() {
        String paciente = paciente();
        var reserva = servico.reservar(paciente, pedido(SEGUNDA.plusDays(5)));
        servico.cancelar(paciente, reserva.id());

        erro(HttpStatus.CONFLICT, "O agendamento já foi cancelado.",
                () -> servico.cancelar(paciente, reserva.id()));
        assertEquals(8, servico.consultarSaldo(paciente).sessoesDisponiveis());
    }

    @Test
    void exigeJwtDePacienteEImpedeManipulacaoDeReservaAlheia() throws Exception {
        String titular = paciente();
        String outro = paciente();
        var reserva = servico.reservar(titular, pedido(SEGUNDA.plusWeeks(1)));

        mvc.perform(get("/agendamentos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/aulas").header(HttpHeaders.AUTHORIZATION, bearer(usuario("ADMIN"))))
                .andExpect(status().isForbidden());
        mvc.perform(get("/agendamentos").header(HttpHeaders.AUTHORIZATION, bearer(outro)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/agendamentos/{id}/cancelamento", reserva.id())
                        .header(HttpHeaders.AUTHORIZATION, bearer(outro)))
                .andExpect(status().isNotFound());
        mvc.perform(put("/agendamentos/{id}/intencao-presenca", reserva.id())
                        .header(HttpHeaders.AUTHORIZATION, bearer(outro)))
                .andExpect(status().isNotFound());

        assertEquals(7, servico.consultarSaldo(titular).sessoesDisponiveis());
        assertEquals(8, servico.consultarSaldo(outro).sessoesDisponiveis());
        assertEquals(1, servico.consultarReservas(titular, false).size());
    }

    @Test
    void reservaUltimaVagaParaSomenteUmPacienteSobConcorrencia() throws Exception {
        LocalDate data = SEGUNDA.plusWeeks(1).plusDays(1);
        servico.reservar(paciente(), pedido(data));
        servico.reservar(paciente(), pedido(data));
        String primeiro = paciente();
        String segundo = paciente();
        CountDownLatch prontos = new CountDownLatch(2);
        CountDownLatch largada = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);

        try {
            var disputa1 = executor.submit(() -> disputarVaga(primeiro, data, prontos, largada));
            var disputa2 = executor.submit(() -> disputarVaga(segundo, data, prontos, largada));
            assertTrue(prontos.await(5, TimeUnit.SECONDS));
            largada.countDown();
            assertNotEquals(disputa1.get(15, TimeUnit.SECONDS), disputa2.get(15, TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }
        assertEquals(0, servico.consultarVagas(data, HORA, "ana").vagasDisponiveis());
        assertEquals(15, servico.consultarSaldo(primeiro).sessoesDisponiveis()
                + servico.consultarSaldo(segundo).sessoesDisponiveis());
    }

    @Test
    void confirmaIntencaoSemRegistrarComparecimentoEListaAulaEncerrada() throws Exception {
        String paciente = paciente();
        LocalDate data = SEGUNDA.plusWeeks(1).plusDays(2);
        String token = bearer(paciente);
        mvc.perform(get("/aulas").param("inicio", data.toString()).param("fim", data.toString())
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(22))
                .andExpect(jsonPath("$[0].instrutor").value("Ana"))
                .andExpect(jsonPath("$[0].paciente").doesNotHaveJsonPath());

        mvc.perform(post("/agendamentos").header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"data":"%s","horario":"09:00","instrutorCodigo":"ana"}
                                """.formatted(data)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.horario").value("09:00"));
        var reserva = servico.consultarReservas(paciente, false).get(0);
        mvc.perform(put("/agendamentos/{id}/intencao-presenca", reserva.id())
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intencaoPresencaConfirmadaEm").isNotEmpty())
                .andExpect(jsonPath("$.compareceu").doesNotHaveJsonPath());

        agora(inicio(data).plusSeconds(1));
        mvc.perform(get("/agendamentos/historico").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].status").value("ENCERRADO"));
    }

    @Test
    void publicaContratoSwaggerComJwt() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.paths['/agendamentos'].post.security[0].bearerAuth").isArray())
                .andExpect(jsonPath("$.paths['/agendamentos'].post.responses['201']").exists());
    }

    private boolean disputarVaga(String paciente, LocalDate data, CountDownLatch prontos, CountDownLatch largada)
            throws InterruptedException {
        prontos.countDown();
        assertTrue(largada.await(5, TimeUnit.SECONDS));
        try {
            servico.reservar(paciente, pedido(data));
            return true;
        } catch (ResponseStatusException erro) {
            assertEquals(HttpStatus.CONFLICT, erro.getStatusCode());
            assertEquals("Não há vagas para esta aula.", erro.getReason());
            return false;
        }
    }

    private void erro(HttpStatus status, String mensagem, Runnable chamada) {
        var erro = assertThrows(ResponseStatusException.class, chamada::run);
        assertEquals(status, erro.getStatusCode());
        assertEquals(mensagem, erro.getReason());
    }

    private String paciente() {
        return usuario("PACIENTE");
    }

    private String usuario(String perfil) {
        var usuario = new Usuario();
        usuario.setNome("Paciente de teste");
        usuario.setEmail(UUID.randomUUID() + "@example.test");
        usuario.setSenhaHash("fixture-sem-login-por-senha");
        usuario.setPerfil(perfil);
        usuarios.save(usuario);
        return usuario.getEmail();
    }

    private void agora(Instant instante) {
        when(relogio.instant()).thenReturn(instante);
    }

    private static Instant inicio(LocalDate data) {
        return data.atTime(HORA).atZone(FUSO_CLINICA).toInstant();
    }

    private static AgendamentoDto.Reserva pedido(LocalDate data) {
        return new AgendamentoDto.Reserva(data, HORA, "ana");
    }

    private String bearer(String email) {
        return "Bearer " + jwt.gerarToken(email);
    }
}
