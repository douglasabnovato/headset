-- 14-vendas.sql · Exercício 14: vendas por estado e 5 maiores clientes.
-- Tabelas do enunciado: clientes(id, nome, email, estado) e pedidos(id, cliente_id, data_pedido, valor_total).

-- a) Estados com maior volume de vendas
SELECT c.estado, SUM(p.valor_total) AS total_vendas, COUNT(*) AS pedidos
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
GROUP BY c.estado
ORDER BY total_vendas DESC;

-- Eloquent:
-- DB::table('pedidos as p')
--     ->join('clientes as c', 'c.id', '=', 'p.cliente_id')
--     ->select('c.estado', DB::raw('SUM(p.valor_total) as total_vendas'), DB::raw('COUNT(*) as pedidos'))
--     ->groupBy('c.estado')
--     ->orderByDesc('total_vendas')
--     ->get();

-- b) 5 clientes que mais compraram
SELECT c.id, c.nome, c.email, SUM(p.valor_total) AS total_comprado
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome, c.email
ORDER BY total_comprado DESC
LIMIT 5;

-- Eloquent (com relacionamento Cliente::hasMany(Pedido::class)):
-- Cliente::select('id', 'nome', 'email')
--     ->withSum('pedidos as total_comprado', 'valor_total')
--     ->orderByDesc('total_comprado')
--     ->limit(5)
--     ->get();

-- c) Otimização
-- 1. Índices: pedidos(cliente_id, valor_total) (índice de cobertura para o JOIN + SUM) e clientes(estado).
CREATE INDEX idx_pedidos_cliente_valor ON pedidos (cliente_id, valor_total);
CREATE INDEX idx_clientes_estado ON clientes (estado);
-- 2. Filtrar período (WHERE data_pedido >= ...) com índice em data_pedido quando o relatório for mensal.
-- 3. Relatórios são leituras repetidas: cache com TTL (Cache::remember) ou tabela resumo/materializada
--    atualizada por job agendado (vendas_por_estado_dia), e rodar em réplica de leitura do RDS.
-- 4. Conferir com EXPLAIN que não há full scan em pedidos.

-- No projeto (Drizzle, server/src/routes/reports.ts), a mesma lógica sobre users/orders,
-- ignorando pedidos cancelados; índice orders_state_idx e orders_user_idx.
