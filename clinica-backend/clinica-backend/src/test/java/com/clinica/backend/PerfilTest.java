package com.clinica.backend;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PerfilTest {
    private static final String SENHA = "SenhaTeste12";
    private static final String NOVA = "NovaSenhaTeste34";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UsuarioRepository usuarios;
    @Autowired BCryptPasswordEncoder bcrypt;
    @Autowired JwtService jwt;

    @Test
    void consultaDadosPessoaisSemCredenciais() throws Exception {
        Usuario usuario = criar("PACIENTE");
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(usuario)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(usuario.getId()))
                .andExpect(jsonPath("$.telefone").value("61999999999"))
                .andExpect(jsonPath("$.dataNascimento").value("2000-01-01"))
                .andExpect(jsonPath("$.senhaHash").doesNotHaveJsonPath())
                .andExpect(jsonPath("$.versaoCredencial").doesNotHaveJsonPath());
    }

    @Test
    void trocaEmailMantendoAIdentidadeMesmoQuandoOutroUsuarioReutilizaOEmailAntigo() throws Exception {
        Usuario usuario = criar("PACIENTE");
        String token = bearer(usuario);
        String novoEmail = email();
        mvc.perform(perfil(token, dados(novoEmail))).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(novoEmail))
                .andExpect(jsonPath("$.nome").value("Paciente Atualizado"))
                .andExpect(jsonPath("$.telefone").value("61888888888"))
                .andExpect(jsonPath("$.dataNascimento").value("2001-02-03"));
        Usuario salvo = usuarios.findById(usuario.getId()).orElseThrow();
        assertEquals(novoEmail, salvo.getEmail());
        assertEquals("61888888888", salvo.getTelefone());
        login(usuario.getEmail(), SENHA).andExpect(status().isUnauthorized());
        login(novoEmail, SENHA).andExpect(status().isOk());

        Usuario outro = criar("PACIENTE");
        outro.setEmail(usuario.getEmail());
        usuarios.save(outro);
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(usuario.getId()));
        mvc.perform(get("/sessoes/saldo").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk());
    }

    @Test
    void rejeitaEmailDuplicado() throws Exception {
        Usuario primeiro = criar("PACIENTE");
        Usuario segundo = criar("PACIENTE");
        mvc.perform(perfil(bearer(primeiro), dados(segundo.getEmail().toUpperCase(java.util.Locale.ROOT))))
                .andExpect(status().isConflict());
        assertEquals(primeiro.getEmail(), usuarios.findById(primeiro.getId()).orElseThrow().getEmail());
    }

    @Test
    void rejeitaDadosInvalidos() throws Exception {
        Usuario usuario = criar("PACIENTE");
        String token = bearer(usuario);
        for (var campos : Map.of(
                "nome", "", "email", "sem-arroba", "telefone", "123", "dataNascimento", "9999-01-01").entrySet()) {
            var dados = dados(usuario.getEmail());
            dados.put(campos.getKey(), campos.getValue());
            mvc.perform(perfil(token, dados)).andExpect(status().isBadRequest());
        }
        assertEquals(usuario.getNome(), usuarios.findById(usuario.getId()).orElseThrow().getNome());
    }

    @Test
    void alteraSenhaRevogaOJwtEExigeNovoLogin() throws Exception {
        Usuario usuario = criar("PACIENTE");
        String token = bearer(usuario);
        mvc.perform(senha(token, SENHA, NOVA, NOVA)).andExpect(status().isNoContent());
        Usuario salvo = usuarios.findById(usuario.getId()).orElseThrow();
        assertTrue(bcrypt.matches(NOVA, salvo.getSenhaHash()));
        assertFalse(bcrypt.matches(SENHA, salvo.getSenhaHash()));
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isUnauthorized());
        mvc.perform(get("/agendamentos").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isUnauthorized());
        login(usuario.getEmail(), SENHA).andExpect(status().isUnauthorized());
        String corpo = login(usuario.getEmail(), NOVA).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + json.readTree(corpo).get("token").asText()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(usuario.getId()));
    }

    @Test
    void rejeitaSenhaAtualIncorretaConfirmacaoDiferenteSenhaFracaEReutilizacao() throws Exception {
        Usuario usuario = criar("PACIENTE");
        String token = bearer(usuario);
        mvc.perform(senha(token, "errada", NOVA, NOVA)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("A senha atual está incorreta."));
        mvc.perform(senha(token, SENHA, NOVA, SENHA)).andExpect(status().isBadRequest());
        mvc.perform(senha(token, SENHA, "abcdefgh", "abcdefgh")).andExpect(status().isBadRequest());
        mvc.perform(senha(token, SENHA, SENHA, SENHA)).andExpect(status().isBadRequest());
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk());
    }

    @Test
    void bloqueiaOperacoesSemAutenticacaoEDeOutroPerfil() throws Exception {
        mvc.perform(put("/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(put("/auth/me/senha")).andExpect(status().isUnauthorized());
        Usuario admin = criar("ADMIN");
        mvc.perform(perfil(bearer(admin), dados(admin.getEmail()))).andExpect(status().isForbidden());
        mvc.perform(senha(bearer(admin), SENHA, NOVA, NOVA)).andExpect(status().isForbidden());
    }

    @Test
    void ignoraIdPermissoesSaldoEHashEnviadosNoCorpo() throws Exception {
        Usuario titular = criar("PACIENTE");
        Usuario outro = criar("PACIENTE");
        String token = bearer(titular);
        var corpo = dados(titular.getEmail());
        corpo.put("id", outro.getId());
        corpo.put("perfil", "ADMIN");
        corpo.put("sessoesDisponiveis", 999);
        corpo.put("senhaHash", "fixture");
        mvc.perform(perfil(token, corpo)).andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(titular.getId())).andExpect(jsonPath("$.perfil").value("PACIENTE"));
        mvc.perform(put("/auth/usuarios/{id}", outro.getId()).header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isForbidden());
        mvc.perform(get("/sessoes/saldo").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.sessoesDisponiveis").value(8));
        Usuario salvo = usuarios.findById(titular.getId()).orElseThrow();
        assertTrue(bcrypt.matches(SENHA, salvo.getSenhaHash()));
        assertEquals(outro.getNome(), usuarios.findById(outro.getId()).orElseThrow().getNome());
    }

    @Test
    void persisteEnderecoNormalizadoEPermiteLimparCampos() throws Exception {
        Usuario usuario = criar("PACIENTE");
        String token = bearer(usuario);
        var corpo = dados(usuario.getEmail());
        corpo.put("endereco", Map.of("logradouro", " Rua A, 12 ", "bairro", "Centro",
                "cidade", "Brasília", "estado", "df", "cep", "70000-123"));
        mvc.perform(perfil(token, corpo)).andExpect(status().isOk())
                .andExpect(jsonPath("$.endereco.estado").value("DF"))
                .andExpect(jsonPath("$.endereco.cep").value("70000123"));
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.endereco.logradouro").value("Rua A, 12"))
                .andExpect(jsonPath("$.endereco.bairro").value("Centro"))
                .andExpect(jsonPath("$.endereco.cidade").value("Brasília"));
        mvc.perform(perfil(token, dados(usuario.getEmail()))).andExpect(status().isOk())
                .andExpect(jsonPath("$.endereco.cep").value("70000123"));
        corpo.put("endereco", Map.of("logradouro", ""));
        mvc.perform(perfil(token, corpo)).andExpect(status().isOk())
                .andExpect(jsonPath("$.endereco.logradouro").isEmpty());
        assertNull(usuarios.findById(usuario.getId()).orElseThrow().getCep());
    }

    @Test
    void rejeitaUfECepInvalidosSemAtualizarPerfil() throws Exception {
        Usuario usuario = criar("PACIENTE");
        var corpo = dados(usuario.getEmail());
        corpo.put("endereco", Map.of("estado", "XX"));
        mvc.perform(perfil(bearer(usuario), corpo)).andExpect(status().isBadRequest());
        corpo.put("endereco", Map.of("cep", "7000X-123"));
        mvc.perform(perfil(bearer(usuario), corpo)).andExpect(status().isBadRequest());
        assertEquals(usuario.getNome(), usuarios.findById(usuario.getId()).orElseThrow().getNome());
    }

    @Test
    void persistePreferenciasEProtegeOEndpoint() throws Exception {
        Usuario usuario = criar("PACIENTE");
        Usuario outro = criar("PACIENTE");
        String token = bearer(usuario);
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.preferencias.email").value(true));
        var corpo = Map.of("email", false, "whatsapp", false, "push", true, "id", outro.getId());
        mvc.perform(put("/auth/me/preferencias").header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(corpo)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.preferencias.whatsapp").value(false));
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.preferencias.email").value(false))
                .andExpect(jsonPath("$.preferencias.push").value(true));
        assertTrue(usuarios.findById(outro.getId()).orElseThrow().getPrefereEmail());

        mvc.perform(put("/auth/me/preferencias")).andExpect(status().isUnauthorized());
        mvc.perform(put("/auth/me/preferencias").header(HttpHeaders.AUTHORIZATION, bearer(criar("ADMIN"))))
                .andExpect(status().isForbidden());
        mvc.perform(put("/auth/me/preferencias").header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"email\":true}"))
                .andExpect(status().isBadRequest());
    }

    private org.springframework.test.web.servlet.ResultActions login(String email, String senha) throws Exception {
        return mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email, "senha", senha))));
    }

    private MockHttpServletRequestBuilder perfil(String token, Map<String, Object> dados) throws Exception {
        return put("/auth/me").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dados));
    }

    private MockHttpServletRequestBuilder senha(String token, String atual, String nova, String confirmacao) throws Exception {
        return put("/auth/me/senha").header(HttpHeaders.AUTHORIZATION, token).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("senhaAtual", atual, "novaSenha", nova, "confirmacaoNovaSenha", confirmacao)));
    }

    private java.util.HashMap<String, Object> dados(String email) {
        return new java.util.HashMap<>(Map.of(
                "nome", "Paciente Atualizado", "email", email, "telefone", "(61) 88888-8888", "dataNascimento", "2001-02-03"));
    }

    private Usuario criar(String perfil) {
        var usuario = new Usuario();
        usuario.setNome("Paciente Original");
        usuario.setEmail(email());
        usuario.setTelefone("61999999999");
        usuario.setDataNascimento(LocalDate.of(2000, 1, 1));
        usuario.setPerfil(perfil);
        usuario.setSenhaHash(bcrypt.encode(SENHA));
        return usuarios.save(usuario);
    }

    private static String email() {
        return UUID.randomUUID() + "@example.test";
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwt.gerarToken(usuario.getId(), usuario.getVersaoCredencial());
    }
}
