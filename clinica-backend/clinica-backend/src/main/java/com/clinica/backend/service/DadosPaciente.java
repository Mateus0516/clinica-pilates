package com.clinica.backend.service;

import com.clinica.backend.model.Usuario;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

record DadosPaciente(String nome, String email, String telefone, LocalDate nascimento) {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@.]+(?:\\.[^\\s@.]+)+$");
    private static final Pattern TELEFONE = Pattern.compile("[0-9() .-]+");
    private static final ZoneId FUSO_CLINICA = ZoneId.of("America/Sao_Paulo");

    static DadosPaciente validar(String nome, String email, String telefone, LocalDate nascimento) {
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
        return new DadosPaciente(nome, email, digitos, nascimento);
    }

    void aplicar(Usuario usuario) {
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setTelefone(telefone);
        usuario.setDataNascimento(nascimento);
    }

    private static ResponseStatusException invalido(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
