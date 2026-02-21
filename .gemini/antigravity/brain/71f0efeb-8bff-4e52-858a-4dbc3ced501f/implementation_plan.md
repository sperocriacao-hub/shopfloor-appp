# Plano de Implementação: Brunswick.pt

Este plano define a arquitetura e os passos iniciais para o desenvolvimento do sistema de gestão de shopfloor "brunswick.pt", garantindo o isolamento completo em relação aos restantes projetos.

## User Review Required

> [!IMPORTANT]
> Precisamos de alinhar três pontos centrais antes de começar a codificar as pastas e tabelas:
> 1. **DADOS do ESP32**: Preciso que coles aqui no chat (ou guardes num ficheiro de texto ao qual eu tenha acesso) os prompts que mencionaste da aba "Supabase para Shopfloor RFID". Como o Gemini não partilha memória automaticamente entre conversas (abas) diferentes, preciso dessa informação para poder replicar e adaptar a inteligência de tabelas que já definiste.
> 2. **STACK DE ESTILOS**: Tenho indicações para criar uma interface visualmente de excelência ("Premium") usando **Vanilla CSS**. Queres seguir por esta via, ou preferes **TailwindCSS** (que tens usado no \`shopfloor-appp\`)? 
> 3. **CONTAS E ISOLAMENTO**: Por uma questão de pura segurança do teu ambiente, recomendo que cries manualmente um novo projeto no portal do **Supabase** agora mesmo (para teres as credenciais em branco) e cries também o projeto na **Vercel** posteriormente. Da minha parte, posso já abrir a fundação do código fonte (Next.js). Posso criar a pasta na tua sandbox \`playground/brunswick\`?

## Proposed Changes

A aplicação será construída com tecnologias desenhadas para alta comunicação de bases de dados (IoT - ESP32) e interfaces altamente reativas.

### Arquitetura Cloud e Edge
- **Supabase**: Toda a receção de dados dos painéis de RFID (ESP32) será feita conectando os dispositivos diretamente às APIs autogeradas do Supabase, aliviando a carga do nosso backend de front-office (Next.js).
- **Core de Aplicação**: Next.js App Router, permitindo Renderização do lado do servidor (SSR) para relatórios pesados de administração.

### Estruturação Lógica de Código

#### [NEW] \`brunswick-pt\` (Root do Projeto)
Inicializaremos o repositório de raiz de Next.js, com suporte a TypeScript.

#### [NEW] Componentes Administrativos (UI)
- Configuração de um módulo transversal de Administração de Interface. Onde o Administrador molda ativamente a aplicação (Cores, Ícones, Formulários para o Shopfloor).
- Ecrã de monitorização técnica: Pings aos ESP32, e queries para determinar congestionamentos no Supabase.

#### [NEW] Módulo de Estrutura de Fábrica
- **Arquitetura SQL**: Criação de Migration para expandir as tabelas de topologia fabril:
  - `areas_fabrica`: Nova tabela para parametrização de Zonas. ID, Nome, `ordem_sequencial` (permitindo drag-and-drop das colunas).
  - `linhas_producao`: ID (Letra), Descrição, Capacidade Diária.
  - `estacoes`: Nome, Tag RFID, Alocado a `area_id` e possivelmente `linha_id`, Tempo de Ciclo, Capacidade de Produção.
  - `estacoes_sequencia`: Tabela relacional (Trellis) para a Árvore de Dependência (Estações Predecessoras e Sucessoras). Fundamental para ligar setores satélite (Carpintaria, Estofos) que alimentam em rede a linha central usando os `offset_dias` definidos nos Roteiros.
- **Interface UI**: Dashboard "Fábrica" no formato **Kanban 2D / Matriz**:
  - Colunas Verticais: Áreas configuradas na base de dados (ordenadas por `ordem_sequencial`).
  - Swimlanes (Linhas Horizontais): Linhas de Produção Físicas (A, B, C, D).
  - No cruzamento (Célula): O Cartão dinâmico da Estação correspondente e o seu SLA, permitindo detetar gargalos onde o barco/peça passa a estar disponível.

#### [NEW] Módulo de Engenharia (Roteiros Produtivos)
- **Tabelas de Sequenciamento e Tempos (Offset)**:
  - `modelo_area_timing`: Define, por Modelo de Barco e por Área (ex: Pintura, Fibra), o **Offset de Dias** (quando deve começar em relação ao "Dia Zero") e a **Duração Estimada** (quantos dias deverá permanecer nessa zona).
  - `roteiros_sequencia`: A espinha dorsal da engenharia. Define o *passo-a-passo* estrito (sequência numérica). Liga um Modelo específico a uma Peça (B.O.M.), determina a 'Estação Destino' e o 'Tempo de Ciclo / SLA específico' dessa operação.
- **Integração Sub-segundo para ESP32**:
  - Criação de uma View Materializada/Dinâmica (`vw_esp32_query_fast`) que pre-cruza (JOIN) a Ordem de Produção Ativa com o seu Roteiro e Estação Destino. O Painel ESP afixado fisicamente apenas precisará de ler o MAC-Address local e o RFID do barco, enviando 2 strings para o backend e recebendo _imediatamente_ o passo em que a sequência vai.
- **Interfaces Front-end**:
  - `admin/engenharia/regras`: Vista em grelha para alterar rápida e dinamicamente Offset/Durações dos Modelos face às Áreas.
  - `admin/engenharia/roteiros`: Construtor visual de Sequências de Passos. Formulário interativo `[Step -> Peça -> Estação -> SLA]`.

#### [NEW] Módulo de Configurações Gerais (Email/SMS)
- **Base de Dados**:
  - `configuracoes_sistema`: Uma tabela de chave-valor (key-value) encriptada para guardar credenciais SMTP (Host, User, Pass, Port) e tokens de SMS de forma dinâmica sem exigir rebuilds ao Next.js sempre que a fábrica mude de fornecedor de comunicação.
  - `logs_notificacoes`: Registo de auditoria (quem recebeu que email/SMS e relativo a que embarcação/estação), útil para debugar falhas do chão de fábrica.
- **Frontend (Interface UI)**:
  - `admin/configuracoes`: Uma view administrativa restrita (apenas Super Admins) desenhada num formulário limpo, em separadores transversais (Geral, Email, SMS, Webhooks).
- **Backend (API)**:
  - Endpoint utilitário `/api/notify` no Next.js (Server Action ou Route Handler) capaz de ler as configurações instanciadas na base de dados no momento e processar as mensagens através do nodemailer/twilio (ou equivalente escolhido pela Brunswick).

## Verification Plan

### Automated Tests
- Scripts automatizados locais para verificação estática do código Typescript.

### Manual Verification
1. **Pings Virtuais do Chão de Fábrica**: Criarei queries HTTP de teste (tipo cURL/Postman scripts) para injetar volumes de informação na base de dados (simulando múltiplos ESP32 a trabalhar em simultâneo) e validar se o Dashboard Administrativo lê em real-time.
2. **Layout Híbrido**: Verificação minuciosa em resoluções Web, Tablet (ex: iPads no chão de fábrica) e Telemóveis.
