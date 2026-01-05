/*
  MIGRAÇÃO SHOPFLOOR 3.0
  Objetivo: Suporte a Configuração de Opcionais, Checklists e Issues.
  
  Instruções: Copie e cole no Editor SQL do supabase.
*/

-- 1. Product Options (Opcionais de Engenharia)
create table if not exists product_options (
  id text primary key default uuid_generate_v4(),
  product_model_id text references products(id), -- Nullable se for global? Vamos deixar vinculado por enquanto.
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- 2. Option Tasks (Checklist do Opcional)
create table if not exists option_tasks (
  id text primary key default uuid_generate_v4(),
  option_id text references product_options(id) on delete cascade,
  description text not null,
  sequence int default 0,
  pdf_url text, -- Link para documento
  created_at timestamptz default now()
);

-- 3. Pivot: Ordens x Opcionais (Quais opções este barco tem?)
create table if not exists production_order_options (
  order_id text references orders(id) on delete cascade,
  option_id text references product_options(id),
  primary key (order_id, option_id)
);

-- 4. Execução de Tarefas (Checklist da Ordem)
create table if not exists task_executions (
  order_id text references orders(id) on delete cascade,
  task_id text references option_tasks(id),
  completed_at timestamptz,
  completed_by text, -- ID do usuário (pode ser texto ou uuid dependendo do auth)
  primary key (order_id, task_id)
);

-- 5. Issues (Reporte de Problemas)
create table if not exists order_issues (
  id text primary key default uuid_generate_v4(),
  order_id text references orders(id) on delete cascade,
  station_id text references assets(id), -- Quem reportou (Estação/Asset)
  type text not null, -- material, adjust, blockage, other
  description text not null,
  status text default 'open', -- open, resolved
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by text
);

-- 6. Atualização na Tabela de Ordens
-- Agora a ordem é enviada para um Asset específico (Estação), não apenas "Area"
alter table orders add column if not exists asset_id text references assets(id);

-- Habilitar Realtime para novas tabelas
alter publication supabase_realtime add table product_options;
alter publication supabase_realtime add table option_tasks;
alter publication supabase_realtime add table production_order_options;
alter publication supabase_realtime add table task_executions;
alter publication supabase_realtime add table order_issues;
