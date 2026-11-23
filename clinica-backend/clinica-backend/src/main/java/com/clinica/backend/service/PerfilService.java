package com.clinica.backend.service;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService.Identidade;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PerfilService {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@.]+(?:\\.[^\\s@.]+)+$");
    private static final Pattern TELEFONE = Pattern.compile("[0-9() .-]+");
    private static final ZoneId FUSO_CLINICA = ZoneId.of("America/Sao_Paulo");

    private static final java.util.Set<String> ESTADOS = java.util.Set.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
            "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO");

    public record Endereco(String logradouro, String bairro, String cidade, String estado, String cep) {}
    public record Preferencias(Boolean email, Boolean whatsapp, Boolean push) {}

    private final UsuarioRepository usuarios;
    private final BCryptPasswordEncoder bcrypt;

    public PerfilService(UsuarioRepository usuarios, BCryptPasswordEncoder bcrypt) {
        this.usuarios = usuarios;
        this.bcrypt = bcrypt;
    }

    @Transactional
    public Usuario atualizar(Identidade identidade, String nome, String email, String telefone, LocalDate nascimento, Endereco endereco) {
        nome = nome == null ? "" : nome.strip();
        email = email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
        if (nome.length() < 3 || nome.length() > 80) throw invalido("Informe um nome entre 3 e 80 caracteres.");
        if (email.length() > 120 || !EMAIL.matcher(email).matches()) throw invalido("Informe um e-mail válido.");
        if (telefone == null || telefone.length() > 30 || !TELEFONE.matcher(telefone).matches()) {
            throw invalido("Informe um telefone válido com DDD.");
        }
        String digitos = telefone.replaceAll("[^0-9]", "");
        if (digitos.length() < 10 || digitos.length() > 11) throw invalido("Informe um telefone válido com DDD.");
        if (nascimento == null || nascimento.isBefore(LocalDate.of(1900, 1, 1))
                || nascimento.isAfter(LocalDate.now(FUSO_CLINICA))) {
            throw invalido("Informe uma data de nascimento válida.");
        }

        Usuario paciente = bloquearPaciente(identidade);
        if (usuarios.existsByEmailIgnoreCaseAndIdNot(email, paciente.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        paciente.setNome(nome);
        paciente.setEmail(email);
        paciente.setTelefone(digitos);
        paciente.setDataNascimento(nascimento);
        if (endereco != null) atualizarEndereco(paciente, endereco);
        return paciente;
    }

    @Transactional
    public Usuario atualizarPreferencias(Identidade identidade, Preferencias preferencias) {
        if (preferencias.email() == null || preferencias.whatsapp() == null || preferencias.push() == null) {
            throw invalido("Informe as três preferências de comunicação.");
        }
        Usuario paciente = bloquearPaciente(identidade);
        paciente.atualizarPreferencias(preferencias.email(), preferencias.whatsapp(), preferencias.push());
        return paciente;
    }

    private void atualizarEndereco(Usuario paciente, Endereco dados) {
        String endereco = campoOpcional(dados.logradouro(), 180);
        String bairro = campoOpcional(dados.bairro(), 100);
        String cidade = campoOpcional(dados.cidade(), 100);
        String estado = campoOpcional(dados.estado(), 2);
        String cep = campoOpcional(dados.cep(), 9);

        if (estado != null) {
            estado = estado.toUpperCase(Locale.ROOT);
            if (!ESTADOS.contains(estado)) throw invalido("Informe uma UF válida.");
        }
        if (cep != null) {
            if (!cep.matches("[0-9]{5}-?[0-9]{3}")) throw invalido("Informe um CEP com oito dígitos.");
            cep = cep.replace("-", "");
        }
        paciente.atualizarEndereco(endereco, bairro, cidade, estado, cep);
    }

    private static String campoOpcional(String valor, int limite) {
        if (valor == null || valor.isBlank()) return null;
        String normalizado = valor.strip();
        if (normalizado.length() > limite) throw invalido("Confira o tamanho dos campos de endereço.");
        return normalizado;
    }

    @Transactional
    public void trocarSenha(Identidade identidade, String atual, String nova, String confirmacao) {
        if (atual == null || atual.isEmpty() || atual.length() > 255) throw invalido("Informe a senha atual.");
        if (nova == null || nova.codePointCount(0, nova.length()) < 8
                || nova.getBytes(StandardCharsets.UTF_8).length > 72
                || nova.codePoints().noneMatch(Character::isLetter)
                || nova.codePoints().noneMatch(Character::isDigit)) {
            throw invalido("A nova senha deve ter pelo menos 8 caracteres, com letra e número, e no máximo 72 bytes.");
        }
        if (!Objects.equals(nova, confirmacao)) throw invalido("A confirmação deve ser igual à nova senha.");

        Usuario paciente = bloquearPaciente(identidade);
        if (!bcrypt.matches(atual, paciente.getSenhaHash())) throw invalido("A senha atual está incorreta.");
        if (bcrypt.matches(nova, paciente.getSenhaHash())) throw invalido("Escolha uma senha diferente da atual.");
        paciente.trocarSenha(bcrypt.encode(nova));
    }

    private Usuario bloquearPaciente(Identidade identidade) {
        Usuario paciente = usuarios.bloquearPorId(identidade.id())
                .filter(usuario -> usuario.getVersaoCredencial() == identidade.versao())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        if (!"PACIENTE".equals(paciente.getPerfil())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso exclusivo para pacientes.");
        }
        return paciente;
    }

    private static ResponseStatusException invalido(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
