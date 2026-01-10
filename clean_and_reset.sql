/*
  SCRIPT DE LIMPEZA E CORREÇÃO
  Objetivo:
  1. Limpar os dados de Produtos e Assets (como solicitado) para inserção manual depois.
  2. Garantir que a tabela pivot existe (sem dar erro de publicação).

  INSTRUÇÕES:
  1. Copie e cole no Supabase SQL Editor.
  2. Execute.
*/

-- 1. Limpeza de Dados (CUIDADO: Isso apaga todos os Produtos e Estações)
DELETE FROM production_order_assets; -- Limpar vinculos primeiro
DELETE FROM production_order_options; -- Limpar vinculos primeiro
DELETE FROM orders; -- Limpar ordens (pois dependem de produtos/assets)
DELETE FROM assets;
DELETE FROM products;

-- 2. Garantir tabela Pivot (Caso não tenha criado ainda)
CREATE TABLE IF NOT EXISTS production_order_options (
  order_id text REFERENCES orders(id) ON DELETE CASCADE,
  option_id text REFERENCES product_options(id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, option_id)
);

-- 3. Correção do Realtime
-- O erro anterior indicou que a tabela já estava na publicação. 
-- Se precisar garantir, o comando abaixo tenta adicionar, mas se der erro pode ignorar pois já está ativo.
-- Para evitar o erro "already member", vou comentar. Se o realtime não funcionar para esta tabela, descomente:
-- ALTER PUBLICATION supabase_realtime ADD TABLE production_order_options;
