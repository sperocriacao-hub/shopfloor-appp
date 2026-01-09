/*
  FIX DE PERSISTENCIA E SEED DE DADOS
  Objetivo: 
  1. Criar tabela pivot faltante (production_order_options).
  2. Popular tabelas de Assets e Products para evitar erros de Chave Estrangeira (FK).

  INSTRUCOES:
  Copie todo o conteudo deste arquivo e execute no SQL Editor do Supabase.
*/

-- 1. Criar Tabela Pivot de Opcoes (Faltante)
CREATE TABLE IF NOT EXISTS production_order_options (
  order_id text REFERENCES orders(id) ON DELETE CASCADE,
  option_id text REFERENCES product_options(id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, option_id)
);

ALTER PUBLICATION supabase_realtime ADD TABLE production_order_options;

-- 2. Seed de Produtos (Evitar erro de FK em ordens)
INSERT INTO products (id, name, description) VALUES
('C21I00000', 'C21I00000', 'Modelo Padrao'),
('C21000000', 'C21000000', 'Modelo Padrao'),
('D59OBLEG0', 'D59OBLEG0', 'Modelo Padrao'),
('D59OB00SA', 'D59OB00SA', 'Modelo Padrao'),
('D65A000SA', 'D65A000SA', 'Modelo Padrao'),
('D70A000SA', 'D70A000SA', 'Modelo Padrao'),
('D77A000SA', 'D77A000SA', 'Modelo Padrao'),
('S45OBLEG0', 'S45OBLEG0', 'Modelo Padrao'),
('S45OB00SA', 'S45OB00SA', 'Modelo Padrao'),
('S53OBLEG0', 'S53OBLEG0', 'Modelo Padrao'),
('S53OB0000', 'S53OB0000', 'Modelo Padrao'),
('S59OBLEG0', 'S59OBLEG0', 'Modelo Padrao'),
('S59OB00SA', 'S59OB00SA', 'Modelo Padrao'),
('S65A000SA', 'S65A000SA', 'Modelo Padrao'),
('T23EXOBUS', 'T23EXOBUS', 'Modelo Padrao'),
('T23PHUS00', 'T23PHUS00', 'Modelo Padrao'),
('T25EXOBUS', 'T25EXOBUS', 'Modelo Padrao'),
('T25PHUS00', 'T25PHUS00', 'Modelo Padrao'),
('T53OBLEG0', 'T53OBLEG0', 'Modelo Padrao'),
('T53OB0000', 'T53OB0000', 'Modelo Padrao'),
('T59OBLEG0', 'T59OBLEG0', 'Modelo Padrao'),
('T59OB00SA', 'T59OB00SA', 'Modelo Padrao'),
('T65A000SA', 'T65A000SA', 'Modelo Padrao'),
('VR4E00000', 'VR4E00000', 'Modelo Padrao'),
('VR4OEUS00', 'VR4OEUS00', 'Modelo Padrao'),
('VR4OE0000', 'VR4OE0000', 'Modelo Padrao'),
('V20I00000', 'V20I00000', 'Modelo Padrao'),
('V20000000', 'V20000000', 'Modelo Padrao'),
('15EL00000', '15EL00000', 'Modelo Padrao'),
('17ELUS000', '17ELUS000', 'Modelo Padrao'),
('17EL00000', '17EL00000', 'Modelo Padrao'),
('18ELUS000', '18ELUS000', 'Modelo Padrao'),
('19EL00000', '19EL00000', 'Modelo Padrao'),
('455OPEN00', '455OPEN00', 'Modelo Padrao'),
('475AXESS0', '475AXESS0', 'Modelo Padrao'),
('505CAB000', '505CAB000', 'Modelo Padrao'),
('505OPEN00', '505OPEN00', 'Modelo Padrao'),
('525AXESS0', '525AXESS0', 'Modelo Padrao'),
('555CAB000', '555CAB000', 'Modelo Padrao'),
('555NBR000', '555NBR000', 'Modelo Padrao'),
('555OPEN00', '555OPEN00', 'Modelo Padrao'),
('605CR0000', '605CR0000', 'Modelo Padrao'),
('605NBR000', '605NBR000', 'Modelo Padrao'),
('605OPEN00', '605OPEN00', 'Modelo Padrao'),
('605SUND00', '605SUND00', 'Modelo Padrao'),
('625WPH000', '625WPH000', 'Modelo Padrao'),
('675BR0000', '675BR0000', 'Modelo Padrao'),
('675CR0000', '675CR0000', 'Modelo Padrao'),
('675OPEN00', '675OPEN00', 'Modelo Padrao'),
('675SUND00', '675SUND00', 'Modelo Padrao'),
('705OPEN00', '705OPEN00', 'Modelo Padrao'),
('705WE0000', '705WE0000', 'Modelo Padrao'),
('705WPH000', '705WPH000', 'Modelo Padrao'),
('755CR0000', '755CR0000', 'Modelo Padrao'),
('755SUND00', '755SUND00', 'Modelo Padrao'),
('755WEOB00', '755WEOB00', 'Modelo Padrao'),
('805CR0000', '805CR0000', 'Modelo Padrao'),
('805OPEN00', '805OPEN00', 'Modelo Padrao'),
('805WEOB00', '805WEOB00', 'Modelo Padrao'),
('805WFS000', '805WFS000', 'Modelo Padrao'),
('805WPH000', '805WPH000', 'Modelo Padrao'),
('875SUND00', '875SUND00', 'Modelo Padrao'),
('905WEOB00', '905WEOB00', 'Modelo Padrao')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed de Assets (Estacoes)
INSERT INTO assets (id, name, type, area, subarea, status, capabilities, default_cycle_time) VALUES
-- Carpintaria
('asset-car-wood-cnc-fanuc', 'CNC – Fanuc', 'Machine', 'Carpintaria', 'Laminação – Madeiras', 'available', ARRAY['CNC – Fanuc'], 60),
('asset-car-wood-lix', 'Lixagem', 'Workstation', 'Carpintaria', 'Laminação – Madeiras', 'available', ARRAY['Lixagem'], 60),
('asset-car-wood-res', 'Resina', 'Workstation', 'Carpintaria', 'Laminação – Madeiras', 'available', ARRAY['Resina'], 60),
('asset-car-wood-mont', 'Montagem', 'Workstation', 'Carpintaria', 'Laminação – Madeiras', 'available', ARRAY['Montagem'], 60),
('asset-car-wood-pick', 'Pick', 'Workstation', 'Carpintaria', 'Laminação – Madeiras', 'available', ARRAY['Pick'], 60),

('asset-car-cloth-cnc-lectra', 'CNC – Lectra', 'Machine', 'Carpintaria', 'Laminação – Panos', 'available', ARRAY['CNC – Lectra'], 60),
('asset-car-cloth-lix', 'Lixagem', 'Workstation', 'Carpintaria', 'Laminação – Panos', 'available', ARRAY['Lixagem'], 60),
('asset-car-cloth-res', 'Resina', 'Workstation', 'Carpintaria', 'Laminação – Panos', 'available', ARRAY['Resina'], 60),
('asset-car-cloth-mont', 'Montagem', 'Workstation', 'Carpintaria', 'Laminação – Panos', 'available', ARRAY['Montagem'], 60),
('asset-car-cloth-pick', 'Pick', 'Workstation', 'Carpintaria', 'Laminação – Panos', 'available', ARRAY['Pick'], 60),

('asset-car-mont-cnc-morb', 'CNC – Morbidelli', 'Machine', 'Carpintaria', 'Subárea Montagem', 'available', ARRAY['CNC – Morbidelli'], 60),
('asset-car-mont-acab', 'Acabamento', 'Workstation', 'Carpintaria', 'Subárea Montagem', 'available', ARRAY['Acabamento'], 60),
('asset-car-mont-orla', 'Orla', 'Workstation', 'Carpintaria', 'Subárea Montagem', 'available', ARRAY['Orla'], 60),
('asset-car-mont-pick', 'Pick', 'Workstation', 'Carpintaria', 'Subárea Montagem', 'available', ARRAY['Pick'], 60),

('asset-car-foam-prep', 'Preparação', 'Workstation', 'Carpintaria', 'Espumas', 'available', ARRAY['Preparação'], 60),
('asset-car-foam-inj', 'Injeção', 'Workstation', 'Carpintaria', 'Espumas', 'available', ARRAY['Injeção'], 60),
('asset-car-foam-pick', 'Pick', 'Workstation', 'Carpintaria', 'Espumas', 'available', ARRAY['Pick'], 60),

-- Estofos
('asset-est-est-cnc', 'CNC', 'Machine', 'Estofos', 'Estofos', 'available', ARRAY['CNC'], 60),
('asset-est-est-kanban', 'Kanban', 'Workstation', 'Estofos', 'Estofos', 'available', ARRAY['Kanban'], 60),
('asset-est-est-bord', 'Bordados', 'Workstation', 'Estofos', 'Estofos', 'available', ARRAY['Bordados'], 60),
('asset-est-est-cost', 'Costura', 'Workstation', 'Estofos', 'Estofos', 'available', ARRAY['Costura'], 60),
('asset-est-est-mont', 'Montagem', 'Workstation', 'Estofos', 'Estofos', 'available', ARRAY['Montagem'], 60),
('asset-est-est-pick', 'Pick', 'Workstation', 'Estofos', 'Estofos', 'available', ARRAY['Pick'], 60),

('asset-est-tap-cnc', 'CNC', 'Machine', 'Estofos', 'Tapizados', 'available', ARRAY['CNC'], 60),
('asset-est-tap-kanban', 'Kanban', 'Workstation', 'Estofos', 'Tapizados', 'available', ARRAY['Kanban'], 60),
('asset-est-tap-mont', 'Montagem', 'Workstation', 'Estofos', 'Tapizados', 'available', ARRAY['Montagem'], 60),
('asset-est-tap-pick', 'Pick', 'Workstation', 'Estofos', 'Tapizados', 'available', ARRAY['Pick'], 60),

('asset-est-banc-cnc', 'CNC', 'Machine', 'Estofos', 'Bancos', 'available', ARRAY['CNC'], 60),
('asset-est-banc-kanban', 'Kanban', 'Workstation', 'Estofos', 'Bancos', 'available', ARRAY['Kanban'], 60),
('asset-est-banc-bord', 'Bordados', 'Workstation', 'Estofos', 'Bancos', 'available', ARRAY['Bordados'], 60),
('asset-est-banc-cost', 'Costura', 'Workstation', 'Estofos', 'Bancos', 'available', ARRAY['Costura'], 60),
('asset-est-banc-mont', 'Montagem', 'Workstation', 'Estofos', 'Bancos', 'available', ARRAY['Montagem'], 60),
('asset-est-banc-pick', 'Pick', 'Workstation', 'Estofos', 'Bancos', 'available', ARRAY['Pick'], 60),

('asset-est-lonas-cnc', 'CNC', 'Machine', 'Estofos', 'Lonas', 'available', ARRAY['CNC'], 60),
('asset-est-lonas-mont', 'Montagem', 'Workstation', 'Estofos', 'Lonas', 'available', ARRAY['Montagem'], 60),
('asset-est-lonas-pick', 'Pick', 'Workstation', 'Estofos', 'Lonas', 'available', ARRAY['Pick'], 60),

-- Laminação
('asset-lam-cob-prep', 'Preparação', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Preparação'], 60),
('asset-lam-cob-cab', 'Cabine de Pintura', 'Machine', 'Laminação', 'Cobertas', 'available', ARRAY['Cabine de Pintura'], 60),
('asset-lam-cob-rep', 'Repassagem', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Repassagem'], 60),
('asset-lam-cob-skin', 'Skin', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Skin'], 60),
('asset-lam-cob-marc', 'Marcação', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Marcação'], 60),
('asset-lam-cob-stiff', 'Stiffen', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Stiffen'], 60),
('asset-lam-cob-est', 'Estrutura', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Estrutura'], 60),
('asset-lam-cob-uniao', 'União Liner/Banheiras', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['União Liner/Banheiras'], 60),
('asset-lam-cob-base', 'Basecoat', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Basecoat'], 60),
('asset-lam-cob-pop', 'Pop', 'Workstation', 'Laminação', 'Cobertas', 'available', ARRAY['Pop'], 60),

('asset-lam-casc-prep', 'Preparação', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Preparação'], 60),
('asset-lam-casc-cab', 'Cabine de Pintura', 'Machine', 'Laminação', 'Cascos', 'available', ARRAY['Cabine de Pintura'], 60),
('asset-lam-casc-rep', 'Repassagem', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Repassagem'], 60),
('asset-lam-casc-skin', 'Skin', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Skin'], 60),
('asset-lam-casc-lam1', 'Lam 1', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Lam 1'], 60),
('asset-lam-casc-lam2', 'Lam 2', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Lam 2'], 60),
('asset-lam-casc-tramp', 'Trampson/Espumas', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Trampson/Espumas'], 60),
('asset-lam-casc-marc', 'Marcação', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Marcação'], 60),
('asset-lam-casc-stiff', 'Stiffen', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Stiffen'], 60),
('asset-lam-casc-est', 'Estrutura', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Estrutura'], 60),
('asset-lam-casc-top', 'Topcoat', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Topcoat'], 60),
('asset-lam-casc-pop', 'Pop', 'Workstation', 'Laminação', 'Cascos', 'available', ARRAY['Pop'], 60),

('asset-lam-lin-prep', 'Preparação', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Preparação'], 60),
('asset-lam-lin-cab', 'Cabine de Pintura', 'Machine', 'Laminação', 'Liners', 'available', ARRAY['Cabine de Pintura'], 60),
('asset-lam-lin-rep', 'Repassagem', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Repassagem'], 60),
('asset-lam-lin-skin', 'Skin', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Skin'], 60),
('asset-lam-lin-marc', 'Marcação', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Marcação'], 60),
('asset-lam-lin-stiff', 'Stiffen', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Stiffen'], 60),
('asset-lam-lin-est', 'Estrutura', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Estrutura'], 60),
('asset-lam-lin-base', 'Basecoat', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Basecoat'], 60),
('asset-lam-lin-pop', 'Pop', 'Workstation', 'Laminação', 'Liners', 'available', ARRAY['Pop'], 60),

('asset-lam-sm-prep', 'Preparação', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Preparação'], 60),
('asset-lam-sm-cab', 'Cabine de Pintura', 'Machine', 'Laminação', 'Small Parts', 'available', ARRAY['Cabine de Pintura'], 60),
('asset-lam-sm-rep', 'Repassagem', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Repassagem'], 60),
('asset-lam-sm-skin', 'Skin', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Skin'], 60),
('asset-lam-sm-col', 'Colagem', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Colagem'], 60),
('asset-lam-sm-stiff', 'Stiffen', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Stiffen'], 60),
('asset-lam-sm-base', 'Basecoat', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Basecoat'], 60),
('asset-lam-sm-pop', 'Pop', 'Workstation', 'Laminação', 'Small Parts', 'available', ARRAY['Pop'], 60),

-- Corte
('asset-cor-cort-casc-marc', 'Marcação', 'Workstation', 'Corte', 'Casco', 'available', ARRAY['Marcação'], 60),
('asset-cor-cort-casc-cab', 'Cabine de Corte', 'Machine', 'Corte', 'Casco', 'available', ARRAY['Cabine de Corte'], 60),

-- Produção
('asset-pro-prod-g-office', 'Escritório Produção', 'Workstation', 'Produção', 'Geral', 'available', ARRAY['Escritório Produção'], 60),
('asset-pro-prod-g-meet', 'Sala de Reunião', 'Workstation', 'Produção', 'Geral', 'available', ARRAY['Sala de Reunião'], 60),

-- Logística
('asset-log-log-emp-01', 'Empilhador 01', 'Machine', 'Logística', 'Armazém', 'available', ARRAY['Empilhador 01'], 60),
('asset-log-log-emp-02', 'Empilhador 02', 'Machine', 'Logística', 'Expedição', 'available', ARRAY['Empilhador 02'], 60),
('asset-log-log-recep', 'Área de Recepção', 'Workstation', 'Logística', 'Recepção', 'available', ARRAY['Área de Recepção'], 60),

-- Qualidade
('asset-qua-qual-lab', 'Laboratório', 'Workstation', 'Qualidade', 'Laboratório', 'available', ARRAY['Laboratório'], 60),
('asset-qua-qual-insp', 'Área de Inspeção Final', 'Workstation', 'Qualidade', 'Inspeção', 'available', ARRAY['Área de Inspeção Final'], 60),
('asset-qua-qual-aud', 'Audit Room', 'Workstation', 'Qualidade', 'Auditoria', 'available', ARRAY['Audit Room'], 60)
ON CONFLICT (id) DO NOTHING;
