-- Execute apenas no ambiente de desenvolvimento/teste depois de criar o esquema.
INSERT INTO planos (codigo, nome, descricao, servico, valor, sessoes, meses, disponivel, beneficios)
VALUES ('mensal', 'Plano Mensal', 'Atendimentos de Pilates com frequência mensal.', 'Pilates',
        320.00, 16, 1, TRUE, '16 sessões de Pilates')
ON DUPLICATE KEY UPDATE codigo = planos.codigo;
