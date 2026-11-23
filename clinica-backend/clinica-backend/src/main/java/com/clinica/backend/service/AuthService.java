
package com.clinica.backend.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Usuario cadastrar(
            String nome,
            String email,
            String senha,
            String telefone,
            LocalDate dataNascimento
    ) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new DuplicateKeyException("E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();

        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenhaHash(
                passwordEncoder.encode(senha)
        );
        usuario.setTelefone(telefone);
        usuario.setDataNascimento(dataNascimento);
        usuario.setPerfil("PACIENTE");
        usuario.iniciarSaldoPorPlano();

        return usuarioRepository.save(usuario);
    }

    public Map<String, Object> login(
            String email,
            String senha
    ) {
        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new BadCredentialsException(
                                "Credenciais inválidas"
                        )
                );

        if (!passwordEncoder.matches(
                senha,
                usuario.getSenhaHash()
        )) {
            throw new BadCredentialsException(
                    "Credenciais inválidas"
            );
        }

        String token = jwtService.gerarToken(
                usuario.getId(), usuario.getVersaoCredencial()
        );

        Map<String, Object> resposta = new HashMap<>();

        resposta.put(
                "mensagem",
                "Login realizado com sucesso"
        );

        resposta.put("token", token);
        resposta.put("tipo", "Bearer");

        resposta.put("id", usuario.getId());
        resposta.put("nome", usuario.getNome());
        resposta.put("email", usuario.getEmail());
        resposta.put("telefone", usuario.getTelefone());
        resposta.put(
                "dataNascimento",
                usuario.getDataNascimento()
        );
        resposta.put("perfil", usuario.getPerfil());

        return resposta;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Transactional
    public Usuario atualizarUsuario(
            Long id,
            String nome,
            String email,
            String telefone,
            LocalDate dataNascimento
    ) {
        Usuario usuario = usuarioRepository
                .bloquearPorId(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Usuário não encontrado"
                        )
                );

        if (!usuario.getEmail().equals(email)
                && usuarioRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException(
                    "E-mail já cadastrado"
            );
        }

        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setTelefone(telefone);
        usuario.setDataNascimento(dataNascimento);

        return usuarioRepository.save(usuario);
    }

    public void deletarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException(
                    "Usuário não encontrado"
            );
        }

        usuarioRepository.deleteById(id);
    }
}
