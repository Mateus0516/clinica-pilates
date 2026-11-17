
package com.clinica.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // Criptografia das senhas
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configuração de segurança
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            // Desabilita CSRF para API REST com JWT
            .csrf(csrf -> csrf.disable())

            // Habilita CORS
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

            // Não utiliza sessões no servidor
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // Tratamento de erros de autenticação
            .exceptionHandling(exception -> exception

                    .authenticationEntryPoint(
                            (request, response, authException) -> {
                                response.sendError(
                                        HttpStatus.UNAUTHORIZED.value(),
                                        "Autenticacao necessaria"
                                );
                            }
                    )

                    .accessDeniedHandler(
                            (request, response, accessDeniedException) -> {
                                response.sendError(
                                        HttpStatus.FORBIDDEN.value(),
                                        "Acesso negado"
                                );
                            }
                    )
            )

            // Permissões dos endpoints
            .authorizeHttpRequests(auth -> auth

                    // Libera requisições de preflight CORS
                    .requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll()

                    // Cadastro e login públicos
                    .requestMatchers(
                            HttpMethod.POST,
                            "/auth/register",
                            "/auth/login"
                    ).permitAll()

                    // Documentação Swagger
                    .requestMatchers(
                            "/swagger-ui/**",
                            "/swagger-ui.html",
                            "/v3/api-docs/**"
                    ).permitAll()

                    // Apenas administradores
                    .requestMatchers(
                            "/auth/usuarios",
                            "/auth/usuarios/**"
                    ).hasRole("ADMIN")

                    // Demais endpoints exigem autenticação
                    .anyRequest().authenticated()
            )

            // Filtro JWT
            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // Configuração de CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Endereços permitidos para o frontend
        config.setAllowedOrigins(List.of(
                "http://localhost:8081",
                "http://127.0.0.1:8081",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "http://localhost:5175",
                "http://127.0.0.1:5175"
        ));

        // Métodos HTTP permitidos
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Cabeçalhos permitidos
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept"
        ));

        // Cabeçalhos disponíveis para o frontend
        config.setExposedHeaders(List.of(
                "Authorization"
        ));

        // Autenticação JWT via Authorization: Bearer
        config.setAllowCredentials(false);

        // Cache da verificação CORS
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Aplica CORS a todos os endpoints
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
