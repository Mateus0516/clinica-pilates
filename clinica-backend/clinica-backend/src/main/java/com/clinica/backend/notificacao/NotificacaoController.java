package com.clinica.backend.notificacao;

import com.clinica.backend.service.JwtService.Identidade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notificacoes")
@Tag(name = "Notificações internas")
@SecurityRequirement(name = "bearerAuth")
class NotificacaoController {
    private final NotificacaoService notificacoes;

    NotificacaoController(NotificacaoService notificacoes) {
        this.notificacoes = notificacoes;
    }

    record Contagem(long total) {}

    @GetMapping
    @Operation(summary = "Lista as notificações do paciente")
    List<NotificacaoDto> listar(@AuthenticationPrincipal Identidade paciente) {
        return notificacoes.listar(paciente.id());
    }

    @GetMapping("/nao-lidas")
    @Operation(summary = "Conta as notificações não lidas")
    Contagem naoLidas(@AuthenticationPrincipal Identidade paciente) {
        return new Contagem(notificacoes.naoLidas(paciente.id()));
    }

    @PutMapping("/{id}/leitura")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Marca uma notificação como lida")
    void marcar(@AuthenticationPrincipal Identidade paciente, @PathVariable Long id) {
        notificacoes.marcar(paciente.id(), id);
    }

    @PutMapping("/leitura")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Marca todas como lidas")
    void marcarTodas(@AuthenticationPrincipal Identidade paciente) {
        notificacoes.marcar(paciente.id(), null);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui uma notificação da caixa do paciente")
    void excluir(@AuthenticationPrincipal Identidade paciente, @PathVariable Long id) {
        notificacoes.excluir(paciente.id(), id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Exclui todas as notificações da caixa do paciente")
    void excluirTodas(@AuthenticationPrincipal Identidade paciente) {
        notificacoes.excluir(paciente.id(), null);
    }
}
