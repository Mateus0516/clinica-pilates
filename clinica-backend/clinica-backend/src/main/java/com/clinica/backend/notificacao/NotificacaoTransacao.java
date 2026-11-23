package com.clinica.backend.notificacao;

import com.clinica.backend.model.Usuario;
import com.clinica.backend.repository.UsuarioRepository;
import java.util.function.Consumer;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class NotificacaoTransacao {
    private final UsuarioRepository usuarios;
    private final TransactionTemplate transacao;

    NotificacaoTransacao(UsuarioRepository usuarios, PlatformTransactionManager manager) {
        this.usuarios = usuarios;
        this.transacao = new TransactionTemplate(manager);
        transacao.setIsolationLevel(TransactionDefinition.ISOLATION_READ_COMMITTED);
    }

    public void porPaciente(Long paciente, Consumer<Usuario> tarefa) {
        transacao.executeWithoutResult(status -> usuarios.bloquearPorId(paciente)
                .filter(usuario -> "PACIENTE".equals(usuario.getPerfil()))
                .ifPresent(tarefa));
    }
}
