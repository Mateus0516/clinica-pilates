package com.clinica.backend;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.clinica.backend.config.JwtAuthenticationFilter;
import com.clinica.backend.config.SecurityConfig;
import com.clinica.backend.controller.AuthController;
import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.AuthService;
import com.clinica.backend.service.JwtService;
import com.clinica.backend.service.PerfilService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class, AuthService.class, PerfilService.class})
class AuthSecurityTest {
    private static final String JWT_TEST_SECRET = UUID.randomUUID().toString();

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JwtService jwt;
    @MockBean UsuarioRepository repository;

    @DynamicPropertySource
    static void jwtSecret(DynamicPropertyRegistry registry) {
        registry.add("jwt.secret", () -> JWT_TEST_SECRET);
    }

    @Test
    void protegeTodasAsOperacoesAdministrativas() throws Exception {
        String patientToken = tokenFor("PACIENTE");
        for (HttpMethod method : new HttpMethod[]{HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE}) {
            String path = method == HttpMethod.GET ? "/auth/usuarios" : "/auth/usuarios/1";
            mvc.perform(MockMvcRequestBuilders.request(method, path))
                    .andExpect(status().isUnauthorized());
            mvc.perform(MockMvcRequestBuilders.request(method, path)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + patientToken))
                    .andExpect(status().isForbidden());
        }

        mvc.perform(get("/auth/usuarios")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenFor("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void consultaSessaoSomenteComJwtValido() throws Exception {
        mvc.perform(get("/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        String expiredToken = Jwts.builder()
                .subject("1")
                .claim("cv", 0L)
                .expiration(Date.from(Instant.now().minusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(JWT_TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mvc.perform(get("/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenFor("PACIENTE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.perfil").value("PACIENTE"))
                .andExpect(jsonPath("$.senhaHash").doesNotHaveJsonPath());
    }

    @Test
    void cadastraAutenticaEConsultaOPaciente() throws Exception {
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuario = invocation.getArgument(0);
            ReflectionTestUtils.setField(usuario, "id", 1L);
            when(repository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
            when(repository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
            return usuario;
        });

        String registration = """
                {
                  "nome": "Paciente Teste",
                  "email": "cadastro@example.test",
                  "senha": "senha-de-teste",
                  "telefone": "61999999999",
                  "dataNascimento": "2000-01-02"
                }
                """;

        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(registration))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("PACIENTE"))
                .andExpect(jsonPath("$.senhaHash").doesNotHaveJsonPath());

        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(registration))
                .andExpect(status().isConflict());

        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"cadastro@example.test","senha":"incorreta"}
                                """))
                .andExpect(status().isUnauthorized());

        String login = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"cadastro@example.test","senha":"senha-de-teste"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = json.readTree(login).path("token").asText();
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Paciente Teste"))
                .andExpect(jsonPath("$.telefone").value("61999999999"))
                .andExpect(jsonPath("$.dataNascimento").value("2000-01-02"));
    }

    @Test
    void rejeitaTokenLegadoBaseadoEmEmail() throws Exception {
        String legado = Jwts.builder()
                .subject("paciente@example.test")
                .expiration(Date.from(Instant.now().plusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(JWT_TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        mvc.perform(get("/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + legado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cadastroRejeitaDadosInvalidosMesmoSemOFormulario() throws Exception {
        for (String corpo : java.util.List.of(
                "{}",
                """
                {"nome":"Paciente Teste","email":"invalido","senha":"Senha123","telefone":"61999999999","dataNascimento":"2000-01-01"}
                """,
                """
                {"nome":"Paciente Teste","email":"paciente@example.test","senha":"Senha123","telefone":"123","dataNascimento":"2000-01-01"}
                """,
                """
                {"nome":"Paciente Teste","email":"paciente@example.test","senha":"Senha123","telefone":"61999999999","dataNascimento":"9999-01-01"}
                """)) {
            mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.erro").isString());
        }
        org.mockito.Mockito.verifyNoInteractions(repository);
    }

    @Test
    void loginIncompletoMantemRespostaDeCredenciaisInvalidas() throws Exception {
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Credenciais inválidas"));
    }

    private String tokenFor(String role) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", 1L);
        String email = role.toLowerCase(Locale.ROOT) + "@example.test";
        usuario.setEmail(email);
        usuario.setPerfil(role);
        when(repository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        return jwt.gerarToken(usuario.getId(), usuario.getVersaoCredencial());
    }
}
