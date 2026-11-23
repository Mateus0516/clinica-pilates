package com.clinica.backend.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey chave;

    private static final long EXPIRACAO =
            1000L * 60 * 60 * 24;

    public JwtService(
            @Value("${jwt.secret}") String segredo
    ) {
        if (segredo.getBytes(
                java.nio.charset.StandardCharsets.UTF_8
        ).length < 32) {
            throw new IllegalArgumentException(
                    "JWT_SECRET deve ter pelo menos 32 bytes"
            );
        }

        this.chave = Keys.hmacShaKeyFor(
                segredo.getBytes(
                    java.nio.charset.StandardCharsets.UTF_8
                )
        );
    }

    public record Identidade(Long id, long versao) implements java.security.Principal {
        @Override
        public String getName() {
            return id.toString();
        }
    }

    public String gerarToken(Long id, long versao) {
        return Jwts.builder()
                .subject(id.toString())
                .claim("cv", versao)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRACAO))
                .signWith(chave)
                .compact();
    }

    public java.util.Optional<Identidade> verificar(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(chave).build().parseSignedClaims(token).getPayload();
            Long versao = claims.get("cv", Long.class);
            if (versao == null) return java.util.Optional.empty();
            return java.util.Optional.of(new Identidade(Long.valueOf(claims.getSubject()), versao));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            return java.util.Optional.empty();
        }
    }
}
