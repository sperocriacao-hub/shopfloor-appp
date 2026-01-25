-- Migration V7: Product Parts & Tracking
-- Enables "Big Parts" / "Small Parts" definition and RFID assignment per Order

-- 1. Product Parts (Definition)
create table product_parts (
    id text primary key,
    product_model_id text references products(id) on delete cascade,
    name text not null, -- "Casco", "Coberta", "Hardtop"
    category text not null, -- "Big", "Medium", "Small"
    rfid_required boolean default false,
    created_at timestamp with time zone default now()
);

-- 2. Order Parts (Instances)
create table order_parts (
    id text primary key,
    order_id text references production_orders(id) on delete cascade,
    part_definition_id text references product_parts(id),
    rfid_tag text, -- The specific tag assigned to this physical part
    status text default 'pending', -- pending, produced, assembled
    created_at timestamp with time zone default now(),
    produced_at timestamp with time zone
);

-- 3. Enable RLS
alter table product_parts enable row level security;
alter table order_parts enable row level security;

-- 4. Policies
create policy "Enable all access for authenticated users" on product_parts for all using (true) with check (true);
create policy "Enable all access for authenticated users" on order_parts for all using (true) with check (true);
