-- 15-estoque.sql · Exercício 15: produtos, fornecedores e estoque.
-- Observação sobre os dados: o estoque id 5 aponta para produto_id 5, que não existe
-- (falta de FK). Os JOINs abaixo ignoram esse registro; em produção a FK impediria o dado órfão.

-- a) Produtos com estoque abaixo da média geral
SELECT pr.id, pr.nome, e.quantidade
FROM produtos pr
JOIN estoque e ON e.produto_id = pr.id
WHERE e.quantidade < (SELECT AVG(quantidade) FROM estoque)
ORDER BY e.quantidade;
-- Média = (100+50+0+300+200)/5 = 130 → Produto 1 (100), Produto 2 (50), Produto 3 (0).

-- Eloquent:
-- $media = Estoque::avg('quantidade');
-- Produto::join('estoque', 'estoque.produto_id', '=', 'produtos.id')
--     ->where('estoque.quantidade', '<', $media)
--     ->orderBy('estoque.quantidade')
--     ->get(['produtos.id', 'produtos.nome', 'estoque.quantidade']);

-- b) Fornecedores com produtos acima da média de preço da própria categoria
SELECT f.nome AS fornecedor, pr.nome AS produto, pr.categoria, pr.preco_unit
FROM produtos pr
JOIN fornecedores f ON f.id = pr.fornecedor_id
JOIN (SELECT categoria, AVG(preco_unit) AS media FROM produtos GROUP BY categoria) m
  ON m.categoria = pr.categoria
WHERE pr.preco_unit > m.media
ORDER BY pr.categoria, pr.preco_unit;
-- Eletrônicos (média 225): Fornecedor B · Produto 2 · 300.
-- Móveis (média 600): Fornecedor A · Produto 4 · 700.

-- Eloquent:
-- $medias = DB::table('produtos')->select('categoria', DB::raw('AVG(preco_unit) as media'))->groupBy('categoria');
-- DB::table('produtos as pr')
--     ->join('fornecedores as f', 'f.id', '=', 'pr.fornecedor_id')
--     ->joinSub($medias, 'm', 'm.categoria', '=', 'pr.categoria')
--     ->whereColumn('pr.preco_unit', '>', 'm.media')
--     ->orderBy('pr.categoria')->orderBy('pr.preco_unit')
--     ->get(['f.nome as fornecedor', 'pr.nome as produto', 'pr.categoria', 'pr.preco_unit']);

-- c) Produtos mais recentes, de fornecedores do Brasil, com estoque acima da média geral
SELECT pr.nome, f.nome AS fornecedor, pr.data_aquisicao, e.quantidade
FROM produtos pr
JOIN fornecedores f ON f.id = pr.fornecedor_id
JOIN estoque e ON e.produto_id = pr.id
WHERE f.pais = 'Brasil'
  AND e.quantidade > (SELECT AVG(quantidade) FROM estoque)
ORDER BY pr.data_aquisicao DESC;
-- Resultado: Produto 4 (Fornecedor A, 2023-01-30, 300 unidades).
-- Decisão: "mais recentes" = ordenados pela data de aquisição, do mais novo para o mais antigo
-- (adicione LIMIT n se quiser só os n últimos). Não filtrei status do fornecedor porque o enunciado não pede;
-- para considerar só ativos, inclua AND f.status = 'Ativo'.

-- Eloquent:
-- $media = Estoque::avg('quantidade');
-- Produto::join('fornecedores', 'fornecedores.id', '=', 'produtos.fornecedor_id')
--     ->join('estoque', 'estoque.produto_id', '=', 'produtos.id')
--     ->where('fornecedores.pais', 'Brasil')
--     ->where('estoque.quantidade', '>', $media)
--     ->orderByDesc('produtos.data_aquisicao')
--     ->get(['produtos.nome', 'fornecedores.nome as fornecedor', 'produtos.data_aquisicao', 'estoque.quantidade']);

-- Índices sugeridos: estoque(produto_id), produtos(fornecedor_id), produtos(categoria, preco_unit), fornecedores(pais).
