/* 
  COPIE E RODE NO SUPABASE SQL EDITOR
*/

-- 1. Engenharia: Adicionar Roteiro aos Produtos
alter table products add column if not exists operations jsonb;

-- 2. RH: Adicionar Campos Faltantes
alter table employees add column if not exists contract_start_date date;
alter table employees add column if not exists talent_matrix text;
alter table employees add column if not exists system_access jsonb;
