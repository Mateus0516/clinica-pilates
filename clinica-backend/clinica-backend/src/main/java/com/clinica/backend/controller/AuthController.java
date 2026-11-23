
package com.clinica.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.clinica.backend.service.JwtService.Identidade;
import com.clinica.backend.service.PerfilService;
import com.clinica.backend.service.PerfilService.Endereco;
import com.clinica.backend.service.PerfilService.Preferencias;
import org.springframework.web.bind.annotation.*;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
@Tag(
    name = "Autenticação",
    description = "Endpoints para cadastro, login e gerenciamento de usuários"
)
public class AuthController {

    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;
    private final PerfilService perfilService;

    public AuthController(
            AuthService authService,
            UsuarioRepository usuarioRepository, PerfilService perfilService
    ) {
        this.authService = authService;
        this.usuarioRepository = usuarioRepository;
        this.perfilService = perfilService;
    }

    @Operation(
        summary = "Cadastrar paciente",
        description = "Cria uma nova conta de paciente com senha criptografada usando BCrypt."
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

        return ResponseEntity.ok(usuario);
    }

    @Operation(
        summary = "Login do usuário",
        description = "Autentica um usuário pelo email e senha e retorna um token JWT."
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

    @Operation(summary = "Consultar usuário autenticado", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public UsuarioResponse consultarMeuPerfil(@AuthenticationPrincipal Identidade identidade) {
        Usuario usuario = usuarioRepository.findById(identidade.id())
                .filter(conta -> conta.getVersaoCredencial() == identidade.versao())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        return dadosPessoais(usuario);
    }

    @Operation(summary = "Atualizar dados pessoais do paciente", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/me")
    public UsuarioResponse atualizarMeuPerfil(@AuthenticationPrincipal Identidade identidade,
            @RequestBody AtualizarPerfilRequest request) {
        return dadosPessoais(perfilService.atualizar(
                identidade, request.nome(), request.email(), request.telefone(), request.dataNascimento(), request.endereco()));
    }

    @Operation(summary = "Salvar preferências de comunicação do paciente",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/me/preferencias")
    public UsuarioResponse atualizarPreferencias(@AuthenticationPrincipal Identidade identidade,
            @RequestBody Preferencias request) {
        return dadosPessoais(perfilService.atualizarPreferencias(identidade, request));
    }

    public record AtualizarPerfilRequest(
            String nome, String email, String telefone, LocalDate dataNascimento, Endereco endereco
    ) {}

    @Operation(summary = "Alterar senha do paciente e revogar tokens anteriores",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/me/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarMinhaSenha(@AuthenticationPrincipal Identidade identidade, @RequestBody SenhaRequest request) {
        perfilService.trocarSenha(identidade, request.senhaAtual(), request.novaSenha(), request.confirmacaoNovaSenha());
    }

    public record SenhaRequest(
            @io.swagger.v3.oas.annotations.media.Schema(format = "password") String senhaAtual,
            @io.swagger.v3.oas.annotations.media.Schema(format = "password") String novaSenha,
            @io.swagger.v3.oas.annotations.media.Schema(format = "password") String confirmacaoNovaSenha
    ) {}

    private static UsuarioResponse dadosPessoais(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getTelefone(),
                usuario.getDataNascimento(), usuario.getPerfil(),
                new Endereco(usuario.getEndereco(), usuario.getBairro(), usuario.getCidade(), usuario.getEstado(), usuario.getCep()),
                new Preferencias(usuario.getPrefereEmail(), usuario.getPrefereWhatsapp(), usuario.getPreferePush()));
    }

    @Operation(
        summary = "Listar usuários",
        description = "Lista todos os usuários cadastrados. Acesso exclusivo de administradores."
    )
    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios =
                authService.listarUsuarios();

        return ResponseEntity.ok(usuarios);
    }

    @Operation(
        summary = "Atualizar usuário",
        description = "Atualiza os dados de um usuário pelo ID. Acesso exclusivo de administradores."
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

        return ResponseEntity.ok(usuario);
    }

    @Operation(
        summary = "Deletar usuário",
        description = "Remove um usuário pelo ID. Acesso exclusivo de administradores."
    )
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deletarUsuario(
            @PathVariable Long id
    ) {
        authService.deletarUsuario(id);

        return ResponseEntity.noContent().build();
    }

    // DTO: impede exposição do hash da senha
    public record UsuarioResponse(
            Long id,
            String nome,
            String email,
            String telefone,
            LocalDate dataNascimento,
            String perfil,
            Endereco endereco,
            Preferencias preferencias
    ) {}

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
