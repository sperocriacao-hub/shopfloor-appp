/* 
  COPIE TODO O CONTEUDO DESTE ARQUIVO
  E COLE NO SUPABASE SQL EDITOR
*/

create table if not exists employees (
  id text primary key,
  worker_number text,
  name text not null,
  contract_type text,
  "group" text,
  area text,
  workstation text,
  shift text,
  supervisor text,
  leader text,
  manager text,
  admission_date date,
  birthday date,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists absenteeism_records (
  id text primary key,
  employee_id text references employees(id),
  date date not null,
  type text not null,
  duration_minutes int,
  created_at timestamptz default now()
);

-- Habilitar Realtime
alter publication supabase_realtime add table employees;
alter publication supabase_realtime add table absenteeism_records;
alter publication supabase_realtime add table assets;
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table events;

-- Updates (Novos Campos)
alter table employees add column if not exists job_title text;

-- Assets
create table if not exists assets (
  id text primary key,
  name text not null,
  type text not null,
  area text not null,
  subarea text,
  status text not null,
  capabilities text[],
  default_cycle_time int default 60
);

-- Products
create table if not exists products (
  id text primary key,
  name text not null,
  description text
);

-- Orders
create table if not exists orders (
  id text primary key,
  product_model_id text references products(id),
  quantity int not null,
  status text not null,
  po text,
  customer text,
  area text,
  start_date timestamptz,
  finish_date timestamptz,
  active_operations jsonb -- Stores array of OperationDefinition
);

-- Events
create table if not exists events (
  id text primary key,
  order_id text references orders(id),
  operation_id text,
  asset_id text references assets(id),
  type text not null,
  timestamp timestamptz default now(),
  reason text
);
