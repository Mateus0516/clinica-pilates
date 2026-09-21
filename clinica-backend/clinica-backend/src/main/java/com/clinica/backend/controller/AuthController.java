package com.clinica.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@Tag(
    name = "Autenticação",
    description = "Endpoints para cadastro, login e gerenciamento de usuários"
)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
        summary = "Cadastrar paciente",
        description = "Cria uma nova conta de paciente no sistema com senha criptografada usando BCrypt."
    )
    @PostMapping("/register")
    public ResponseEntity<Usuario> cadastrar(
            @RequestBody CadastroRequest request
    ) {
        Usuario usuario = authService.cadastrar(
                request.nome(),
                request.email(),
                request.senha(),
                request.telefone(),
                request.dataNascimento()
        );

        usuario.setSenhaHash(null);

        return ResponseEntity.ok(usuario);
    }

    @Operation(
        summary = "Login do usuário",
        description = "Autentica um usuário pelo email e senha cadastrados."
    )
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(
                        request.email(),
                        request.senha()
                )
        );
    }

    @Operation(
        summary = "Listar usuários",
        description = "Lista todos os usuários cadastrados."
    )
    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios =
                authService.listarUsuarios();

        usuarios.forEach(
                usuario -> usuario.setSenhaHash(null)
        );

        return ResponseEntity.ok(usuarios);
    }

    @Operation(
        summary = "Atualizar usuário",
        description = "Atualiza os dados de um usuário pelo ID."
    )
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(
            @PathVariable Long id,
            @RequestBody AtualizarUsuarioRequest request
    ) {
        Usuario usuario =
                authService.atualizarUsuario(
                        id,
                        request.nome(),
                        request.email(),
                        request.telefone(),
                        request.dataNascimento()
                );

        usuario.setSenhaHash(null);

        return ResponseEntity.ok(usuario);
    }

    @Operation(
        summary = "Deletar usuário",
        description = "Remove um usuário pelo ID."
    )
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deletarUsuario(
            @PathVariable Long id
    ) {
        authService.deletarUsuario(id);

        return ResponseEntity.noContent().build();
    }

    public record CadastroRequest(
            String nome,
            String email,
            String senha,
            String telefone,
            LocalDate dataNascimento
    ) {}

    public record LoginRequest(
            String email,
            String senha
    ) {}

    public record AtualizarUsuarioRequest(
            String nome,
            String email,
            String telefone,
            LocalDate dataNascimento
    ) {}
}