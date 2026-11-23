package com.clinica.backend.planos;

import com.clinica.backend.agendamento.SaldoSessoesService;
import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import com.clinica.backend.service.JwtService.Identidade;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
class PlanosService {
    private final PlanoRepository planos;
    private final ContratacaoPlanoRepository contratacoes;
    private final PagamentoPlanoRepository pagamentos;
    private final UsuarioRepository usuarios;
    private final SaldoSessoesService saldos;
    private final Clock relogio;

    PlanosService(PlanoRepository planos, ContratacaoPlanoRepository contratacoes,
                  PagamentoPlanoRepository pagamentos, UsuarioRepository usuarios, SaldoSessoesService saldos,
                  Clock relogio) {
        this.planos = planos;
        this.contratacoes = contratacoes;
        this.pagamentos = pagamentos;
        this.usuarios = usuarios;
        this.saldos = saldos;
        this.relogio = relogio;
    }

    public List<PlanosDto.Oferta> catalogo() {
        return planos.findByDisponivelTrueOrderByNomeAsc().stream().filter(this::condicoesValidas).map(this::oferta).toList();
    }

    public PlanosDto.Contratacoes contratacoes(Long id) {
        LocalDate hoje = LocalDate.now(relogio);
        List<PlanosDto.Contratacao> registros = contratacoes.findByPacienteIdOrderByContratadoEmDescIdDesc(id)
                .stream().map(contratacao -> contratacao(contratacao, hoje)).toList();
        return new PlanosDto.Contratacoes(
                registros.stream().filter(c -> "ATIVO".equals(c.status())).findFirst().orElse(null),
                registros.stream().filter(c -> "PENDENTE".equals(c.status())).findFirst().orElse(null),
                registros.stream().filter(c -> "ENCERRADO".equals(c.status())).toList());
    }

    public List<PlanosDto.Pagamento> pagamentos(Long id) {
        return pagamentos.findByContratacaoPacienteIdOrderByCriadoEmDescIdDesc(id)
                .stream().map(this::pagamento).toList();
    }

    public PlanosDto.Pagamento pagamento(Long paciente, Long id) {
        return pagamento(buscarPagamento(paciente, id));
    }

    public PlanosDto.Metodo metodo(Long id) {
        String forma = usuarios.findById(id).orElseThrow().getFormaPagamentoSimulado();
        return new PlanosDto.Metodo(forma == null ? null : PagamentoPlano.Forma.valueOf(forma));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PlanosDto.Metodo salvarMetodo(Identidade identidade, PlanosDto.Metodo metodo) {
        if (metodo.forma() == null) throw erro(HttpStatus.BAD_REQUEST, "Escolha uma forma de pagamento simulada.");
        Usuario usuario = bloquearPaciente(identidade);
        usuario.setFormaPagamentoSimulado(metodo.forma().name());
        return metodo;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PlanosDto.Pagamento contratar(Identidade identidade, PlanosDto.Pedido pedido) {
        String chave;
        try {
            chave = UUID.fromString(pedido.chave()).toString();
        } catch (NullPointerException | IllegalArgumentException invalida) {
            throw erro(HttpStatus.BAD_REQUEST, "Informe uma chave de pedido válida.");
        }
        if (pedido.planoCodigo() == null || pedido.planoCodigo().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "Escolha um plano do catálogo.");
        }
        Usuario paciente = bloquearPaciente(identidade);
        var anterior = contratacoes.findByPacienteIdAndChavePedido(paciente.getId(), chave);
        if (anterior.isPresent()) {
            var existente = anterior.get();
            if (!existente.getPlano().getCodigo().equals(pedido.planoCodigo())
                    || !Objects.equals(existente.getRenovacaoDeId(), pedido.renovacaoDeId())) {
                throw erro(HttpStatus.CONFLICT, "A chave já foi usada em outro pedido.");
            }
            return pagamento(pagamentos.findByContratacaoId(existente.getId()).orElseThrow());
        }

        var registros = contratacoes.findByPacienteIdOrderByContratadoEmDescIdDesc(paciente.getId());
        LocalDate hoje = LocalDate.now(relogio);
        if (registros.stream().anyMatch(c -> c.getInicio() == null || c.getVencimento().isAfter(hoje))) {
            throw erro(HttpStatus.CONFLICT, "Finalize o pedido pendente ou aguarde o vencimento do plano atual.");
        }

        ContratacaoPlano renovacao = null;
        if (pedido.renovacaoDeId() != null) {
            renovacao = contratacoes.findByIdAndPacienteId(pedido.renovacaoDeId(), paciente.getId())
                    .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Contratação não encontrada."));
            if (registros.isEmpty() || !registros.get(0).getId().equals(renovacao.getId())
                    || !renovacao.getPlano().getCodigo().equals(pedido.planoCodigo())) {
                throw erro(HttpStatus.CONFLICT, "Somente a contratação mais recente do mesmo plano pode ser renovada.");
            }
        }

        Plano plano = planos.findByCodigoAndDisponivelTrue(pedido.planoCodigo())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Plano indisponível."));
        if (!condicoesValidas(plano)) {
            throw erro(HttpStatus.CONFLICT, "As condições do plano estão indisponíveis.");
        }

        Instant agora = relogio.instant();
        var contratacao = contratacoes.save(new ContratacaoPlano(paciente, plano, renovacao, agora, chave));
        LocalDate vencimentoDaCobranca = renovacao == null ? null : renovacao.getVencimento();
        return pagamento(pagamentos.save(new PagamentoPlano(contratacao, agora, vencimentoDaCobranca)));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PlanosDto.Pagamento simularPagamento(Identidade identidade, Long id, PlanosDto.Metodo metodo) {
        Usuario paciente = bloquearPaciente(identidade);
        PagamentoPlano pagamento = buscarPagamento(paciente.getId(), id);
        if (pagamento.getPagoEm() != null) return pagamento(pagamento);
        if (metodo.forma() == null) throw erro(HttpStatus.BAD_REQUEST, "Escolha uma forma de pagamento simulada.");

        var contratacao = pagamento.getContratacao();
        Instant agora = relogio.instant();
        contratacao.ativar(agora.atZone(relogio.getZone()).toLocalDate());
        pagamento.registrarSimulacao(agora, metodo.forma());
        saldos.creditar(paciente, contratacao.getSessoesContratadas());
        return pagamento(pagamento);
    }

    private Usuario bloquearPaciente(Identidade identidade) {
        Usuario usuario = usuarios.bloquearPorId(identidade.id())
                .filter(conta -> conta.getVersaoCredencial() == identidade.versao())
                .orElseThrow(() -> erro(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
        if (!"PACIENTE".equals(usuario.getPerfil())) throw erro(HttpStatus.FORBIDDEN, "Acesso exclusivo para pacientes.");
        return usuario;
    }

    private PagamentoPlano buscarPagamento(Long paciente, Long id) {
        return pagamentos.findByIdAndContratacaoPacienteId(id, paciente)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pagamento não encontrado."));
    }

    private boolean condicoesValidas(Plano plano) {
        return plano.getValor().signum() > 0 && plano.getSessoes() > 0 && plano.getMeses() > 0;
    }

    private PlanosDto.Oferta oferta(Plano plano) {
        return new PlanosDto.Oferta(plano.getCodigo(), plano.getNome(), plano.getDescricao(), plano.getServico(),
                plano.getValor(), plano.getSessoes(), plano.getMeses(), beneficios(plano.getBeneficios()));
    }

    private PlanosDto.Contratacao contratacao(ContratacaoPlano contrato, LocalDate hoje) {
        String status = contrato.getInicio() == null ? "PENDENTE"
                : hoje.isBefore(contrato.getVencimento()) ? "ATIVO" : "ENCERRADO";
        var oferta = new PlanosDto.Oferta(contrato.getPlano().getCodigo(), contrato.getNomeContratado(),
                contrato.getDescricaoContratada(), contrato.getServicoContratado(), contrato.getValorContratado(),
                contrato.getSessoesContratadas(), contrato.getMesesContratados(), beneficios(contrato.getBeneficiosContratados()));
        return new PlanosDto.Contratacao(contrato.getId(), oferta, contrato.getContratadoEm(), contrato.getInicio(),
                contrato.getVencimento(), status, contrato.getRenovacaoDeId(), contrato.getSessoesRestantes());
    }

    private List<String> beneficios(String texto) {
        return texto == null ? List.of() : texto.lines().filter(linha -> !linha.isBlank()).toList();
    }

    private PlanosDto.Pagamento pagamento(PagamentoPlano pagamento) {
        var contrato = pagamento.getContratacao();
        return new PlanosDto.Pagamento(pagamento.getId(), contrato.getId(), contrato.getNomeContratado(),
                pagamento.getValor(), pagamento.getCriadoEm(), pagamento.getVencimento(), pagamento.getPagoEm(),
                pagamento.getForma(), pagamento.getPagoEm() == null ? "PENDENTE" : "PAGO", true);
    }

    private static ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
