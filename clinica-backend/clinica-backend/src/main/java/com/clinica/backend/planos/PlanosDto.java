package com.clinica.backend.planos;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class PlanosDto {
    private PlanosDto() {}

    public record Oferta(String codigo, String nome, String descricao, String servico,
                         BigDecimal valor, int sessoes, int meses, List<String> beneficios) {}

    public record Contratacao(Long id, Oferta plano, Instant contratadoEm, LocalDate inicio,
                              LocalDate vencimento, String status, Long renovacaoDeId, int sessoesDisponiveis) {}

    public record Contratacoes(Contratacao atual, Contratacao pendente, List<Contratacao> historico) {}

    public record Pedido(String planoCodigo, Long renovacaoDeId, String chave) {}
    public record Metodo(PagamentoPlano.Forma forma) {}

    public record Pagamento(Long id, Long contratacaoId, String plano, BigDecimal valor, Instant criadoEm,
                            LocalDate vencimento, Instant pagoEm, PagamentoPlano.Forma forma,
                            String status, boolean simulado) {}
}
