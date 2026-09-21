package com.clinica.backend;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.service.AuthService;

@SpringBootTest
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void deveCadastrarUsuario() {
        Usuario usuario = authService.cadastrar(
                "Teste Cadastro",
                "cadastroteste" + System.currentTimeMillis() + "@email.com",
                "123456",
                "61999999999",
                LocalDate.of(2000, 5, 16)
        );

        assertNotNull(usuario.getId());
        assertEquals("Teste Cadastro", usuario.getNome());
        assertEquals("61999999999", usuario.getTelefone());
        assertEquals(
                LocalDate.of(2000, 5, 16),
                usuario.getDataNascimento()
        );
        assertEquals("PACIENTE", usuario.getPerfil());
    }

    @Test
    void deveFazerLoginComSucesso() {
        String email =
                "loginteste" + System.currentTimeMillis() + "@email.com";

        authService.cadastrar(
                "Teste Login",
                email,
                "123456",
                "61999999999",
                LocalDate.of(1999, 8, 10)
        );

        Map<String, Object> resposta =
                authService.login(email, "123456");

        assertEquals(
                "Login realizado com sucesso",
                resposta.get("mensagem")
        );

        assertEquals(
                "Teste Login",
                resposta.get("nome")
        );

        assertEquals(
                "61999999999",
                resposta.get("telefone")
        );

        assertEquals(
                LocalDate.of(1999, 8, 10),
                resposta.get("dataNascimento")
        );

        assertEquals(
                "PACIENTE",
                resposta.get("perfil")
        );
    }

    @Test
    void deveDarErroComSenhaInvalida() {
        String email =
                "senhateste" + System.currentTimeMillis() + "@email.com";

        authService.cadastrar(
                "Teste Senha",
                email,
                "123456",
                "61999999999",
                LocalDate.of(2001, 1, 20)
        );

        RuntimeException erro = assertThrows(
                RuntimeException.class,
                () -> authService.login(
                        email,
                        "senhaerrada"
                )
        );

        assertEquals(
                "Senha inválida",
                erro.getMessage()
        );
    }

    @Test
    void deveAtualizarUsuario() {
        String email =
                "atualizarteste" + System.currentTimeMillis() + "@email.com";

        Usuario usuario = authService.cadastrar(
                "Nome Antigo",
                email,
                "123456",
                "61999999999",
                LocalDate.of(2000, 1, 1)
        );

        String novoEmail =
                "novo" + System.currentTimeMillis() + "@email.com";

        Usuario atualizado =
                authService.atualizarUsuario(
                        usuario.getId(),
                        "Nome Novo",
                        novoEmail,
                        "61888888888",
                        LocalDate.of(1998, 12, 15)
                );

        assertEquals(
                "Nome Novo",
                atualizado.getNome()
        );

        assertEquals(
                novoEmail,
                atualizado.getEmail()
        );

        assertEquals(
                "61888888888",
                atualizado.getTelefone()
        );

        assertEquals(
                LocalDate.of(1998, 12, 15),
                atualizado.getDataNascimento()
        );
    }

    @Test
    void deveDeletarUsuario() {
        String email =
                "deleteteste" + System.currentTimeMillis() + "@email.com";

        Usuario usuario = authService.cadastrar(
                "Teste Delete",
                email,
                "123456",
                "61999999999",
                LocalDate.of(2002, 3, 25)
        );

        authService.deletarUsuario(
                usuario.getId()
        );

        RuntimeException erro = assertThrows(
                RuntimeException.class,
                () -> authService.deletarUsuario(
                        usuario.getId()
                )
        );

        assertEquals(
                "Usuário não encontrado",
                erro.getMessage()
        );
    }
}