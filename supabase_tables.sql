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
