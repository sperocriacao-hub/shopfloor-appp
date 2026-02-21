# Brunswick.pt - Shopfloor Management System

## Fase 1: Setup e Infraestrutura
- [x] Criar novo diretório e inicializar a aplicação (Next.js)
- [x] Configurar novo projeto no Supabase (Base de Dados e Auth isolados)
- [x] Configurar repositório Git e novo projeto no Vercel
- [x] Integrar Supabase com a aplicação Next.js (.env.local)

## Fase 2: Arquitetura de Base de Dados (ESP32 & Shopfloor)
- [x] Analisar os prompts "Supabase para Shopfloor RFID" indicados pelo utilizador
- [x] Criar tabelas principais (Equipamentos, Ordens de Produção, Logs ESP32)
- [x] Criar tabelas de configuração (Cores, Unidades de Medida, Notificações)
- [x] Desenvolver as políticas de segurança e roles (RLS - Row Level Security)

## Fase 4: Módulo de Estrutura de Fábrica
- [x] Construir script SQL (Supabase) reduzindo as estações a topologia básica `0002`.
- [x] Construir script SQL migração `0003` para tabelas de Áreas dinâmicas com ordering sequencial.
- [x] Refatorar UI/Dashboard de Visualização usando Matriz 2D Kanban (Áreas vs Linhas) integrada de forma bidirecional com modais de adição ao Supabase.
- [x] Criar UI/Dashboard de Visualização de Árvore e Área de Estações.

## Fase 3: Módulo de Administração e Diagnóstico
- [x] Criar interface UI Premium e dinâmica (Layout Responsivo)
- [x] Desenvolver Dashboard de Diagnóstico (Estado da BD, Comunicação ESP32)
- [ ] Desenvolver Módulo de Configuração Dinâmica (Formulários, Ícones, Relatórios)
- [x] Módulo de Cadastro de Produtos (Modelos, Composição e Opcionais com Anexos Cloud)
- [x] Geração dinâmica de Checklist em PDF por Estação de Trabalho
- [x] Planeamento de Produção (Cronogramas dinâmicos por Offset e Manutenção de Moldes)
- [ ] Configurações Gerais do Sistema de Reportes (Email, SMS)
- [x] Interface Operador Chão-de-Fábrica (Simulador leitura IoT)

## Fase 5: Engenharia e Roteiros Automáticos
- [x] Construir script SQL migração `0004` para criar tabelas de `roteiros_padrao`, `roteiros_sequencia` e `modelo_area_timing`.
- [x] Criar View Materializada `vw_esp32_query_fast` para consulta sub-segundo de Barco vs Estação Esperada.
- [x] Desenvolver UI de "Regras de Sequenciamento por Produto" (Definir Offset e Duração por Área/Modelo).
- [x] Desenvolver UI "Cadastro do Roteiro Detalhado" passo a passo (Select Modelo, Sequência, Peça da B.O.M., Estação Destino, SLA Específico).
