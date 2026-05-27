package com.clinica.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Usuario> cadastrar(@RequestBody CadastroRequest request) {
        Usuario usuario = authService.cadastrar(
                request.nome(),
                request.email(),
                request.senha()
        );

        usuario.setSenhaHash(null);
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                authService.login(request.email(), request.senha())
        );
    }

    public record CadastroRequest(String nome, String email, String senha) {}
    public record LoginRequest(String email, String senha) {}
}
