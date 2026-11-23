package com.clinica.backend.config;

import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem.HttpMethod;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class OpenApiConfig {
    @Bean
    OpenApiCustomizer documentacaoTimely() {
        return api -> {
            api.setInfo(new Info().title("Timely API")
                    .description("Autoatendimento do paciente. O módulo de pagamentos é exclusivamente simulado."));
            api.getPaths().forEach((path, item) -> item.readOperationsMap().forEach((method, operation) -> {
                adicionar(operation, "500", "Erro interno");
                boolean publico = path.equals("/auth/login") || path.equals("/auth/register");
                if (!publico || path.equals("/auth/login")) adicionar(operation, "401", "Credenciais ou sessão inválidas");
                if (!publico && !path.equals("/auth/me") || path.equals("/auth/me") && method == HttpMethod.PUT) {
                    adicionar(operation, "403", "Perfil sem permissão");
                }
                if (method != HttpMethod.GET || operation.getParameters() != null && !operation.getParameters().isEmpty()) {
                    adicionar(operation, "400", "Corpo ou parâmetros inválidos");
                }
                if (path.contains("{id}") || path.equals("/planos/contratacoes") && method == HttpMethod.POST) {
                    adicionar(operation, "404", "Recurso não encontrado ou fora da conta autenticada");
                }
                if (path.equals("/auth/register") || path.equals("/auth/me") && method == HttpMethod.PUT
                        || path.equals("/planos/contratacoes") && method == HttpMethod.POST
                        || path.startsWith("/auth/usuarios") && method != HttpMethod.GET) {
                    adicionar(operation, "409", "Conflito com os dados ou o estado atual");
                }
            }));
        };
    }

    private static void adicionar(Operation operation, String codigo, String descricao) {
        operation.getResponses().putIfAbsent(codigo, new ApiResponse().description(descricao));
    }
}
