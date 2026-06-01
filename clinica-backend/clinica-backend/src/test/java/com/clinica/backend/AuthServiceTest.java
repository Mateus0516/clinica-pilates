package com.clinica.backend;

import static org.junit.jupiter.api.Assertions.*;

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
                "123456"
        );

        assertNotNull(usuario.getId());
        assertEquals("Teste Cadastro", usuario.getNome());
    }

    @Test
    void deveFazerLoginComSucesso() {
        String email = "loginteste" + System.currentTimeMillis() + "@email.com";

        authService.cadastrar("Teste Login", email, "123456");

        Map<String, Object> resposta = authService.login(email, "123456");

        assertEquals("Login realizado com sucesso", resposta.get("mensagem"));
        assertEquals("Teste Login", resposta.get("nome"));
    }

    @Test
    void deveDarErroComSenhaInvalida() {
        String email = "senhateste" + System.currentTimeMillis() + "@email.com";

        authService.cadastrar("Teste Senha", email, "123456");

        RuntimeException erro = assertThrows(
                RuntimeException.class,
                () -> authService.login(email, "senhaerrada")
        );

        assertEquals("Senha inválida", erro.getMessage());
    }

    @Test
    void deveAtualizarUsuario() {
        String email = "atualizarteste" + System.currentTimeMillis() + "@email.com";

        Usuario usuario = authService.cadastrar(
                "Nome Antigo",
                email,
                "123456"
        );

        Usuario atualizado = authService.atualizarUsuario(
                usuario.getId(),
                "Nome Novo",
                "novo" + System.currentTimeMillis() + "@email.com"
        );

        assertEquals("Nome Novo", atualizado.getNome());
    }

    @Test
    void deveDeletarUsuario() {
        String email = "deleteteste" + System.currentTimeMillis() + "@email.com";

        Usuario usuario = authService.cadastrar(
                "Teste Delete",
                email,
                "123456"
        );

        authService.deletarUsuario(usuario.getId());

        RuntimeException erro = assertThrows(
                RuntimeException.class,
                () -> authService.deletarUsuario(usuario.getId())
        );

        assertEquals("Usuário não encontrado", erro.getMessage());
    }
}