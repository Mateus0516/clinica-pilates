package com.clinica.backend.planos;

import com.clinica.backend.service.JwtService.Identidade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@Tag(name = "Planos e pagamentos simulados")
@SecurityRequirement(name = "bearerAuth")
class PlanosController {
    private final PlanosService planos;

    PlanosController(PlanosService planos) {
        this.planos = planos;
    }

    @GetMapping("/planos")
    @Operation(summary = "Consulta o catálogo de planos")
    List<PlanosDto.Oferta> catalogo() {
        return planos.catalogo();
    }

    @GetMapping("/planos/contratacoes")
    @Operation(summary = "Consulta a contratação vigente e o histórico do paciente")
    PlanosDto.Contratacoes contratacoes(@AuthenticationPrincipal Identidade paciente) {
        return planos.contratacoes(paciente.id());
    }

    @PostMapping("/planos/contratacoes")
    @Operation(summary = "Emite um pedido de contratação ou renovação com o preço do catálogo")
    PlanosDto.Pagamento contratar(@AuthenticationPrincipal Identidade paciente, @RequestBody PlanosDto.Pedido pedido) {
        return planos.contratar(paciente, pedido);
    }

    @GetMapping("/pagamentos/metodo")
    @Operation(summary = "Consulta a forma de pagamento simulado preferida")
    PlanosDto.Metodo metodo(@AuthenticationPrincipal Identidade paciente) {
        return planos.metodo(paciente.id());
    }

    @PutMapping("/pagamentos/metodo")
    @Operation(summary = "Salva a preferência de pagamento simulado, sem dados bancários")
    PlanosDto.Metodo salvarMetodo(@AuthenticationPrincipal Identidade paciente, @RequestBody PlanosDto.Metodo metodo) {
        return planos.salvarMetodo(paciente, metodo);
    }

    @PostMapping("/pagamentos/{id}/simulacao")
    @Operation(summary = "Registra a simulação e concede as sessões uma única vez")
    PlanosDto.Pagamento simular(@AuthenticationPrincipal Identidade paciente, @PathVariable Long id,
                                @RequestBody PlanosDto.Metodo metodo) {
        return planos.simularPagamento(paciente, id, metodo);
    }

    @GetMapping("/pagamentos")
    @Operation(summary = "Lista os pagamentos simulados do paciente")
    List<PlanosDto.Pagamento> pagamentos(@AuthenticationPrincipal Identidade paciente) {
        return planos.pagamentos(paciente.id());
    }

    @GetMapping("/pagamentos/{id}")
    @Operation(summary = "Consulta os dados de um pagamento simulado do próprio paciente")
    PlanosDto.Pagamento pagamento(@AuthenticationPrincipal Identidade paciente, @PathVariable Long id) {
        return planos.pagamento(paciente.id(), id);
    }
}
