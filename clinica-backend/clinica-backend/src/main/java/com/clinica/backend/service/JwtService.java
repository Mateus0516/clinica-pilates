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

    public String gerarToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(
                        System.currentTimeMillis()
                                + EXPIRACAO
                ))
                .signWith(chave)
                .compact();
    }

    public String extrairEmail(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validarToken(String token) {
        try {
            extrairEmail(token);
            return true;
        } catch (io.jsonwebtoken.JwtException
                 | IllegalArgumentException e) {
            return false;
        }
    }
}
