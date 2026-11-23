package com.clinica.backend.agendamento;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import java.time.Clock;
import java.time.ZoneId;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;

@Configuration
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
class AgendamentoConfig {
    static final ZoneId FUSO_CLINICA = ZoneId.of("America/Sao_Paulo");

    @Bean
    Clock relogioClinica() {
        return Clock.system(FUSO_CLINICA);
    }

    @Bean
    ApplicationRunner cadastrarInstrutoresIniciais(InstrutorRepository instrutores) {
        return args -> {
            cadastrarSeAusente(instrutores, "ana", "Ana");
            cadastrarSeAusente(instrutores, "bruno", "Bruno");
        };
    }

    private void cadastrarSeAusente(InstrutorRepository instrutores, String codigo, String nome) {
        if (instrutores.existsById(codigo)) return;
        try {
            instrutores.saveAndFlush(new Instrutor(codigo, nome));
        } catch (DataIntegrityViolationException concorrencia) {
            if (!instrutores.existsById(codigo)) throw concorrencia;
        }
    }
}
