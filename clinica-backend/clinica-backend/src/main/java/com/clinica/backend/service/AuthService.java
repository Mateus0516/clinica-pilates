package com.clinica.backend.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario cadastrar(
            String nome,
            String email,
            String senha,
            String telefone,
            LocalDate dataNascimento
    ) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
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

        return usuarioRepository.save(usuario);
    }

    public Map<String, Object> login(
            String email,
            String senha
    ) {
        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Usuário não encontrado"
                        )
                );

        boolean senhaCorreta =
                passwordEncoder.matches(
                        senha,
                        usuario.getSenhaHash()
                );

        if (!senhaCorreta) {
            throw new RuntimeException(
                    "Senha inválida"
            );
        }

        Map<String, Object> resposta =
                new HashMap<>();

        resposta.put(
                "mensagem",
                "Login realizado com sucesso"
        );

        resposta.put(
                "id",
                usuario.getId()
        );

        resposta.put(
                "nome",
                usuario.getNome()
        );

        resposta.put(
                "email",
                usuario.getEmail()
        );

        resposta.put(
                "telefone",
                usuario.getTelefone()
        );

        resposta.put(
                "dataNascimento",
                usuario.getDataNascimento()
        );

        resposta.put(
                "perfil",
                usuario.getPerfil()
        );

        return resposta;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario atualizarUsuario(
            Long id,
            String nome,
            String email,
            String telefone,
            LocalDate dataNascimento
    ) {
        Usuario usuario = usuarioRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Usuário não encontrado"
                        )
                );

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