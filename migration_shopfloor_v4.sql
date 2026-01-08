/*
  MIGRAÇÃO SHOPFLOOR V4
  Objetivo: Suporte a Múltiplas Estações, Roteamento de Tarefas e Refinamento de Issues.
  
  Instruções: Execute este script no Editor SQL do Supabase.
*/

-- 1. Melhoria nas Tarefas (Vincular tarefa a uma estação específica)
-- Isso permite que, ao selecionar uma opção (ex: "Teca"), suas tarefas sejam distribuídas para as estações corretas (ex: "Carpintaria", "Montagem").
ALTER TABLE option_tasks ADD COLUMN IF NOT EXISTS station_id text REFERENCES assets(id);

-- 2. Melhoria nas Issues (Estação Causadora)
-- Permite indicar qual estação causou o problema (ex: Falta de material na Montagem, culpa do Armazém).
ALTER TABLE order_issues ADD COLUMN IF NOT EXISTS related_station_id text REFERENCES assets(id);

-- 3. Pivot: Ordens x Estações (Múltiplos Destinos)
-- Substitui a coluna única 'asset_id' por uma relação muitos-para-muitos.
CREATE TABLE IF NOT EXISTS production_order_assets (
  order_id text REFERENCES orders(id) ON DELETE CASCADE,
  asset_id text REFERENCES assets(id),
  PRIMARY KEY (order_id, asset_id)
);

-- 4. Garantir vinculo de Produto na Opção
ALTER TABLE product_options ADD COLUMN IF NOT EXISTS product_model_id text;

-- 5. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_order_assets;
