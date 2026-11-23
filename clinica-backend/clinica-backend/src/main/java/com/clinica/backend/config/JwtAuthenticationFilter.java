
package com.clinica.backend.config;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository
    ) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization =
                request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization != null
                && authorization.startsWith("Bearer ")) {

            String token = authorization.substring(7);

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                jwtService.verificar(token).ifPresent(identidade ->
                    usuarioRepository.findById(identidade.id())
                        .filter(usuario -> usuario.getVersaoCredencial() == identidade.versao())
                        .ifPresent(usuario -> {
                            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil()));
                            var authentication = new UsernamePasswordAuthenticationToken(identidade, null, authorities);
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        })
                );
            }
        }

        filterChain.doFilter(request, response);
    }
}
