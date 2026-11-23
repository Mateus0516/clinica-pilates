package com.clinica.backend.notificacao;

import java.time.Instant;

public record NotificacaoDto(Long id, String tipo, String titulo, String mensagem, Instant criadaEm,
                             boolean lida, String evento, Long origemId, String destino) {}
