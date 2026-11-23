package com.clinica.backend.notificacao;

import com.clinica.backend.agendamento.LembreteAula;
import com.clinica.backend.model.Usuario;
import com.clinica.backend.planos.LembretePlano;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "timely.notificacoes.cron=-")
@AutoConfigureMockMvc
class NotificacaoTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UsuarioRepository usuarios;
    @Autowired JwtService jwt;
    @Autowired DataSource dataSource;
    @Autowired LembreteAula aulas;
    @Autowired LembretePlano planos;
    @MockBean Clock clock;

    @BeforeEach
    void configurar() {
        when(clock.getZone()).thenReturn(ZoneId.of("America/Sao_Paulo"));
        agora("2035-01-01T15:00:00Z");
    }

    @Test
    void persisteReservaECancelamentoComResultadoDaSessao() throws Exception {
        String paciente = paciente();
        long reserva = reservar(paciente, "2035-01-02");
        cancelar(paciente, reserva);
        mvc.perform(post("/agendamentos/{id}/cancelamento", reserva).header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(status().isConflict());
        mvc.perform(get("/notificacoes").header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].evento").value("CANCELAMENTO"))
                .andExpect(jsonPath("$[0].mensagem").value(containsString("foi devolvida")))
                .andExpect(jsonPath("$[1].evento").value("AGENDAMENTO"))
                .andExpect(jsonPath("$[1].destino").value("/aulas"));

        long outra = reservar(paciente, "2035-01-03");
        agora("2035-01-03T08:00:01Z");
        cancelar(paciente, outra);
        mvc.perform(get("/notificacoes").header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(jsonPath("$[0].mensagem").value(containsString("não foi devolvida")));
    }

    @Test
    void protegeIsolamentoEAtualizaLeituraEExclusao() throws Exception {
        String titular = paciente();
        String outro = paciente();
        reservar(titular, "2035-01-05");
        reservar(titular, "2035-01-06");
        long id = listar(titular).get(0).get("id").asLong();
        mvc.perform(get("/notificacoes")).andExpect(status().isUnauthorized());
        mvc.perform(get("/notificacoes/nao-lidas")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/notificacoes")).andExpect(status().isUnauthorized());
        mvc.perform(put("/notificacoes/{id}/leitura", id).header(HttpHeaders.AUTHORIZATION, outro))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/notificacoes/{id}", id).header(HttpHeaders.AUTHORIZATION, outro))
                .andExpect(status().isNotFound());

        contar(titular, 2);
        contar(outro, 0);
        mvc.perform(put("/notificacoes/{id}/leitura", id).header(HttpHeaders.AUTHORIZATION, titular))
                .andExpect(status().isNoContent());
        contar(titular, 1);
        mvc.perform(put("/notificacoes/leitura").header(HttpHeaders.AUTHORIZATION, titular))
                .andExpect(status().isNoContent());
        contar(titular, 0);
        mvc.perform(delete("/notificacoes/{id}", id).header(HttpHeaders.AUTHORIZATION, titular))
                .andExpect(status().isNoContent());
        assertEquals(1, listar(titular).size());
        mvc.perform(delete("/notificacoes").header(HttpHeaders.AUTHORIZATION, titular))
                .andExpect(status().isNoContent());
        assertTrue(listar(titular).isEmpty());
    }

    @Test
    void recuperaLembreteDentroDaJanelaSemAvisarAulaCanceladaNemRecriarExcluida() throws Exception {
        String titular = paciente();
        String outro = paciente();
        reservar(titular, "2035-01-09");
        long cancelada = reservar(outro, "2035-01-09");
        cancelar(outro, cancelada);

        agora("2035-01-08T11:59:59Z");
        aulas.enviar();
        assertEquals(1, listar(titular).size());
        agora("2035-01-08T15:00:00Z");
        var executor = Executors.newFixedThreadPool(2);
        try {
            var primeira = executor.submit(aulas::enviar);
            var segunda = executor.submit(aulas::enviar);
            primeira.get(15, TimeUnit.SECONDS);
            segunda.get(15, TimeUnit.SECONDS);
        } finally {
            executor.shutdownNow();
        }
        assertEquals(2, listar(titular).size());
        assertTrue(evento(titular, "AULA_PROXIMA"));
        assertFalse(evento(outro, "AULA_PROXIMA"));

        mvc.perform(delete("/notificacoes").header(HttpHeaders.AUTHORIZATION, titular))
                .andExpect(status().isNoContent());
        aulas.enviar();
        assertTrue(listar(titular).isEmpty());
    }

    @Test
    void pagamentoAtivacaoERenovacaoSaoAtomicosESemDuplicatas() throws Exception {
        carregarOferta();
        agora("2035-02-03T15:00:00Z");
        String paciente = paciente();
        long pagamento = pedir(paciente, null);
        assertTrue(listar(paciente).isEmpty());
        pagar(paciente, pagamento);
        pagar(paciente, pagamento);
        assertEquals(2, listar(paciente).size());
        assertTrue(evento(paciente, "PAGAMENTO"));
        assertTrue(evento(paciente, "PLANO_ATIVADO"));

        agora("2035-03-03T11:00:00Z");
        long contrato = listar(paciente).get(0).get("origemId").asLong();
        pagar(paciente, pedir(paciente, contrato));
        assertTrue(evento(paciente, "PLANO_RENOVADO"));
        agora("2035-03-03T12:00:00Z");
        planos.enviar();
        assertFalse(evento(paciente, "PLANO_VENCIDO"));
    }

    @Test
    void recuperaAvisosDePlanoNoFusoDaClinicaEIgnoraRegistroJaExcluido() throws Exception {
        carregarOferta();
        agora("2035-04-04T15:00:00Z");
        String paciente = paciente();
        pagar(paciente, pedir(paciente, null));
        agora("2035-05-01T11:59:59Z");
        planos.enviar();
        assertFalse(evento(paciente, "PLANO_A_VENCER"));
        agora("2035-05-02T15:00:00Z");
        planos.enviar();
        assertTrue(evento(paciente, "PLANO_A_VENCER"));

        agora("2035-05-04T11:59:59Z");
        planos.enviar();
        assertFalse(evento(paciente, "PLANO_VENCIDO"));
        agora("2035-05-05T12:00:00Z");
        planos.enviar();
        planos.enviar();
        assertEquals(4, listar(paciente).size());
        assertTrue(evento(paciente, "PLANO_VENCIDO"));
        mvc.perform(delete("/notificacoes").header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(status().isNoContent());
        planos.enviar();
        assertTrue(listar(paciente).isEmpty());
    }

    private String paciente() {
        Usuario usuario = new Usuario();
        usuario.setNome("Paciente Notificação");
        usuario.setEmail(UUID.randomUUID() + "@example.test");
        usuario.setSenhaHash("fixture");
        usuario.setPerfil("PACIENTE");
        usuarios.save(usuario);
        return "Bearer " + jwt.gerarToken(usuario.getId(), usuario.getVersaoCredencial());
    }

    private long reservar(String paciente, String data) throws Exception {
        return json.readTree(mvc.perform(post("/agendamentos").header(HttpHeaders.AUTHORIZATION, paciente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("data", data, "horario", "09:00", "instrutorCodigo", "ana"))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asLong();
    }

    private void cancelar(String paciente, long id) throws Exception {
        mvc.perform(post("/agendamentos/{id}/cancelamento", id).header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(status().isOk());
    }

    private void carregarOferta() {
        new ResourceDatabasePopulator(new FileSystemResource("sql/catalogo-dev.sql")).execute(dataSource);
    }

    private long pedir(String paciente, Long anterior) throws Exception {
        var dados = new java.util.HashMap<>(Map.<String, Object>of("planoCodigo", "mensal", "chave", UUID.randomUUID().toString()));
        if (anterior != null) dados.put("renovacaoDeId", anterior);
        return json.readTree(mvc.perform(post("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, paciente)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("id").asLong();
    }

    private void pagar(String paciente, long id) throws Exception {
        mvc.perform(post("/pagamentos/{id}/simulacao", id).header(HttpHeaders.AUTHORIZATION, paciente)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"forma\":\"PIX\"}"))
                .andExpect(status().isOk());
    }

    private JsonNode listar(String paciente) throws Exception {
        return json.readTree(mvc.perform(get("/notificacoes").header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    private boolean evento(String paciente, String evento) throws Exception {
        for (JsonNode item : listar(paciente)) if (evento.equals(item.get("evento").asText())) return true;
        return false;
    }

    private void contar(String paciente, int total) throws Exception {
        mvc.perform(get("/notificacoes/nao-lidas").header(HttpHeaders.AUTHORIZATION, paciente))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(total));
    }

    private void agora(String data) { when(clock.instant()).thenReturn(Instant.parse(data)); }
}
