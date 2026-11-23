package com.clinica.backend.planos;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PlanosTest {
    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository usuarios;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;
    @Autowired DataSource dataSource;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlanosService planos;
    @MockBean Clock relogio;

    @BeforeAll
    void carregarCatalogo() {
        new ResourceDatabasePopulator(new FileSystemResource("sql/catalogo-dev.sql")).execute(dataSource);
        jdbc.update("""
                insert into planos (codigo, nome, descricao, servico, valor, sessoes, meses, disponivel)
                values ('dinamico', 'Teste dinâmico', 'Plano de teste', 'Pilates', 75.50, 3, 2, true),
                       ('invalido', 'Teste inválido', 'Plano de teste', 'Pilates', -10, 1, 1, true)
                """);
    }

    @BeforeEach
    void configurarData() {
        when(relogio.getZone()).thenReturn(ZoneId.of("America/Sao_Paulo"));
        agora("2030-01-07T15:00:00Z");
    }

    @Test
    void consultaCatalogoEContratacaoProtegidos() throws Exception {
        mvc.perform(get("/planos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/planos/contratacoes")).andExpect(status().isUnauthorized());
        mvc.perform(get("/pagamentos")).andExpect(status().isUnauthorized());
        String token = token(paciente(false));
        mvc.perform(get("/planos").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$[?(@.codigo == 'mensal')].valor").value(320.0))
                .andExpect(jsonPath("$[?(@.codigo == 'invalido')]").isEmpty());
        mvc.perform(get("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.atual").isEmpty());
    }

    @Test
    void pedidoUsaPrecoDoBancoPreservaCotacaoEAtivaSomenteAposPagamento() throws Exception {
        String token = token(paciente(false));
        String chave = UUID.randomUUID().toString();
        long id = pedido(token, Map.of("planoCodigo", "dinamico", "chave", chave, "valor", 0, "status", "PAGO"));
        saldo(token, 0);
        mvc.perform(get("/pagamentos/{id}", id).header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.vencimento").isEmpty());
        mvc.perform(get("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.pendente.plano.valor").value(75.50));

        jdbc.update("update planos set valor = 90, sessoes = 4, meses = 3 where codigo = 'dinamico'");
        try {
            assertEquals(id, pedido(token, Map.of("planoCodigo", "dinamico", "chave", chave)));
            simular(token, id).andExpect(status().isOk()).andExpect(jsonPath("$.valor").value(75.50))
                    .andExpect(jsonPath("$.simulado").value(true));
            simular(token, id).andExpect(status().isOk());
            saldo(token, 3);
            mvc.perform(get("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(jsonPath("$.atual.plano.sessoes").value(3))
                    .andExpect(jsonPath("$.atual.vencimento").value("2030-03-07"));
        } finally {
            jdbc.update("update planos set valor = 75.50, sessoes = 3, meses = 2 where codigo = 'dinamico'");
        }
    }

    @Test
    void renovaNoVencimentoAcumulaSessoesESalvaHistorico() throws Exception {
        String token = token(paciente(true));
        saldo(token, 8);
        long pagamento = mensal(token, null);
        simular(token, pagamento).andExpect(status().isOk());
        saldo(token, 24);
        long contrato = json.readTree(mvc.perform(get("/pagamentos/{id}", pagamento).header(HttpHeaders.AUTHORIZATION, token))
                .andReturn().getResponse().getContentAsString()).get("contratacaoId").asLong();
        mvc.perform(postJson("/planos/contratacoes", token,
                Map.of("planoCodigo", "mensal", "renovacaoDeId", contrato, "chave", UUID.randomUUID().toString())))
                .andExpect(status().isConflict());
        agora("2030-02-07T15:00:00Z");
        long renovacao = mensal(token, contrato);
        simular(token, renovacao).andExpect(status().isOk())
                .andExpect(jsonPath("$.vencimento").value("2030-02-07"));
        saldo(token, 40);
        mvc.perform(get("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.atual.renovacaoDeId").value(contrato))
                .andExpect(jsonPath("$.historico[0].id").value(contrato));
    }

    @Test
    void protegeDadosEntrePacientesERejeitaEntradasInvalidas() throws Exception {
        String titular = token(paciente(false));
        String outro = token(paciente(false));
        long id = mensal(titular, null);
        mvc.perform(get("/pagamentos/{id}", id).header(HttpHeaders.AUTHORIZATION, outro))
                .andExpect(status().isNotFound());
        simular(outro, id).andExpect(status().isNotFound());
        mvc.perform(get("/pagamentos").header(HttpHeaders.AUTHORIZATION, outro))
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(postJson("/planos/contratacoes", outro, Map.of("planoCodigo", "mensal", "chave", "incorreta")))
                .andExpect(status().isBadRequest());
        mvc.perform(postJson("/planos/contratacoes", outro,
                Map.of("planoCodigo", "invalido", "chave", UUID.randomUUID().toString())))
                .andExpect(status().isConflict());
        mvc.perform(postJson("/pagamentos/" + id + "/simulacao", titular, Map.of("forma", "DINHEIRO")))
                .andExpect(status().isBadRequest());
        saldo(titular, 0);
        saldo(outro, 0);
        mvc.perform(put("/pagamentos/metodo").header(HttpHeaders.AUTHORIZATION, titular)
                .contentType(MediaType.APPLICATION_JSON).content("{\"forma\":\"CARTAO_CREDITO\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/pagamentos/metodo").header(HttpHeaders.AUTHORIZATION, titular))
                .andExpect(jsonPath("$.forma").value("CARTAO_CREDITO"));
    }

    @Test
    void concorrenciaNoPedidoENoPagamentoNaoDuplicaCreditos() throws Exception {
        Usuario usuario = paciente(false);
        var identidade = new JwtService.Identidade(usuario.getId(), usuario.getVersaoCredencial());
        var pedido = new PlanosDto.Pedido("mensal", null, UUID.randomUUID().toString());

        var resultados = concorrentes(() -> planos.contratar(identidade, pedido));
        assertEquals(resultados.get(0).id(), resultados.get(1).id());
        long id = resultados.get(0).id();

        var pagamentos = concorrentes(() -> planos.simularPagamento(identidade, id,
                new PlanosDto.Metodo(PagamentoPlano.Forma.PIX)));
        assertEquals(pagamentos.get(0).pagoEm(), pagamentos.get(1).pagoEm());
        saldo(token(usuario), 16);
    }

    @Test
    void reservaDebitaCreditoDoPlanoECancelamentoDevolveAoMesmoCredito() throws Exception {
        String token = token(paciente(false));
        simular(token, mensal(token, null)).andExpect(status().isOk());
        var reserva = mvc.perform(postJson("/agendamentos", token,
                Map.of("data", "2030-01-08", "horario", "09:00", "instrutorCodigo", "ana")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        saldo(token, 15);
        mvc.perform(get("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.atual.sessoesDisponiveis").value(15));
        mvc.perform(post("/agendamentos/{id}/cancelamento", json.readTree(reserva).get("id").asLong())
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.sessaoDevolvida").value(true));
        saldo(token, 16);
        mvc.perform(get("/planos/contratacoes").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.atual.sessoesDisponiveis").value(16));
    }

    @Test
    void cadastroNovoPelaApiIniciaComSaldoZero() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        String senha = UUID.randomUUID().toString();
        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(
                Map.of("nome", "Novo Paciente", "email", email, "senha", senha, "telefone", "61999999999",
                        "dataNascimento", "2000-01-01")))).andExpect(status().isOk());
        var resposta = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email, "senha", senha))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        saldo("Bearer " + json.readTree(resposta).get("token").asText(), 0);
    }

    private <T> java.util.List<T> concorrentes(java.util.concurrent.Callable<T> operacao) throws Exception {
        var executor = Executors.newFixedThreadPool(2);
        var prontas = new CountDownLatch(2);
        var iniciar = new CountDownLatch(1);
        java.util.concurrent.Callable<T> executar = () -> {
            prontas.countDown();
            assertTrue(iniciar.await(5, TimeUnit.SECONDS));
            return operacao.call();
        };
        try {
            var primeira = executor.submit(executar);
            var segunda = executor.submit(executar);
            assertTrue(prontas.await(5, TimeUnit.SECONDS));
            iniciar.countDown();
            return java.util.List.of(primeira.get(15, TimeUnit.SECONDS), segunda.get(15, TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }
    }

    private void agora(String instante) {
        when(relogio.instant()).thenReturn(Instant.parse(instante));
    }

    private long mensal(String token, Long renovacao) throws Exception {
        var dados = new java.util.HashMap<String, Object>(Map.of("planoCodigo", "mensal", "chave", UUID.randomUUID().toString()));
        if (renovacao != null) dados.put("renovacaoDeId", renovacao);
        return pedido(token, dados);
    }

    private long pedido(String token, Map<String, Object> dados) throws Exception {
        String resposta = mvc.perform(postJson("/planos/contratacoes", token, dados))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(resposta).get("id").asLong();
    }

    private ResultActions simular(String token, long id) throws Exception {
        return mvc.perform(postJson("/pagamentos/" + id + "/simulacao", token, Map.of("forma", "PIX")));
    }

    private void saldo(String token, int esperado) throws Exception {
        mvc.perform(get("/sessoes/saldo").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.sessoesDisponiveis").value(esperado));
    }

    private MockHttpServletRequestBuilder postJson(String path, String token, Map<String, Object> body) throws Exception {
        return post(path).header(HttpHeaders.AUTHORIZATION, token).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(body));
    }

    private Usuario paciente(boolean legado) {
        Usuario paciente = new Usuario();
        paciente.setNome("Paciente Teste");
        paciente.setEmail(UUID.randomUUID() + "@example.test");
        paciente.setSenhaHash("fixture");
        if (!legado) paciente.iniciarSaldoPorPlano();
        return usuarios.save(paciente);
    }

    private String token(Usuario usuario) {
        return "Bearer " + jwt.gerarToken(usuario.getId(), usuario.getVersaoCredencial());
    }
}
