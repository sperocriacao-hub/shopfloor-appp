
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    Asset, ProductModel, Routing, ProductionOrder, ProductionEvent, Employee,
    OrderStatus, AssetStatus, AbsenteeismRecord,
    ProductOption, OptionTask, OrderIssue, TaskExecution,
    QualityCase, QualityAction, ScrapReport,
    Tool, ToolTransaction, ToolMaintenance,
    ConsumableTransaction, CostCenterMapping, PpeRequest
} from '@/types';
import { supabase } from '@/lib/supabase';

// Helper to create assets
const createAsset = (idSuffix: string, name: string, area: string, subarea: string | undefined): Asset => ({
    id: `asset-${area.toLowerCase().substring(0, 3)}-${idSuffix}`,
    name,
    type: name.includes('CNC') ? 'Machine' : 'Workstation',
    area,
    subarea,
    status: 'available',
    capabilities: [name],
    defaultCycleTime: 60
});

const initialAssets: Asset[] = [
    // 1.1 Área: Carpintaria
    createAsset('wood-cnc-fanuc', 'CNC – Fanuc', 'Carpintaria', 'Laminação – Madeiras'),
    createAsset('wood-lix', 'Lixagem', 'Carpintaria', 'Laminação – Madeiras'),
    createAsset('wood-res', 'Resina', 'Carpintaria', 'Laminação – Madeiras'),
    createAsset('wood-mont', 'Montagem', 'Carpintaria', 'Laminação – Madeiras'),
    createAsset('wood-pick', 'Pick', 'Carpintaria', 'Laminação – Madeiras'),

    createAsset('cloth-cnc-lectra', 'CNC – Lectra', 'Carpintaria', 'Laminação – Panos'),
    createAsset('cloth-lix', 'Lixagem', 'Carpintaria', 'Laminação – Panos'),
    createAsset('cloth-res', 'Resina', 'Carpintaria', 'Laminação – Panos'),
    createAsset('cloth-mont', 'Montagem', 'Carpintaria', 'Laminação – Panos'),
    createAsset('cloth-pick', 'Pick', 'Carpintaria', 'Laminação – Panos'),

    createAsset('mont-cnc-morb', 'CNC – Morbidelli', 'Carpintaria', 'Subárea Montagem'),
    createAsset('mont-acab', 'Acabamento', 'Carpintaria', 'Subárea Montagem'),
    createAsset('mont-orla', 'Orla', 'Carpintaria', 'Subárea Montagem'),
    createAsset('mont-pick', 'Pick', 'Carpintaria', 'Subárea Montagem'),

    createAsset('foam-prep', 'Preparação', 'Carpintaria', 'Espumas'),
    createAsset('foam-inj', 'Injeção', 'Carpintaria', 'Espumas'),
    createAsset('foam-pick', 'Pick', 'Carpintaria', 'Espumas'),

    // 1.2 Área: Estofos
    createAsset('est-cnc', 'CNC', 'Estofos', 'Estofos'),
    createAsset('est-kanban', 'Kanban', 'Estofos', 'Estofos'),
    createAsset('est-bord', 'Bordados', 'Estofos', 'Estofos'),
    createAsset('est-cost', 'Costura', 'Estofos', 'Estofos'),
    createAsset('est-mont', 'Montagem', 'Estofos', 'Estofos'),
    createAsset('est-pick', 'Pick', 'Estofos', 'Estofos'),

    createAsset('tap-cnc', 'CNC', 'Estofos', 'Tapizados'),
    createAsset('tap-kanban', 'Kanban', 'Estofos', 'Tapizados'),
    createAsset('tap-mont', 'Montagem', 'Estofos', 'Tapizados'),
    createAsset('tap-pick', 'Pick', 'Estofos', 'Tapizados'),

    createAsset('banc-cnc', 'CNC', 'Estofos', 'Bancos'),
    createAsset('banc-kanban', 'Kanban', 'Estofos', 'Bancos'),
    createAsset('banc-bord', 'Bordados', 'Estofos', 'Bancos'),
    createAsset('banc-cost', 'Costura', 'Estofos', 'Bancos'),
    createAsset('banc-mont', 'Montagem', 'Estofos', 'Bancos'),
    createAsset('banc-pick', 'Pick', 'Estofos', 'Bancos'),

    createAsset('lonas-cnc', 'CNC', 'Estofos', 'Lonas'),
    createAsset('lonas-mont', 'Montagem', 'Estofos', 'Lonas'),
    createAsset('lonas-pick', 'Pick', 'Estofos', 'Lonas'),

    // 1.3 Área: Laminação
    createAsset('cob-prep', 'Preparação', 'Laminação', 'Cobertas'),
    createAsset('cob-cab', 'Cabine de Pintura', 'Laminação', 'Cobertas'),
    createAsset('cob-rep', 'Repassagem', 'Laminação', 'Cobertas'),
    createAsset('cob-skin', 'Skin', 'Laminação', 'Cobertas'),
    createAsset('cob-marc', 'Marcação', 'Laminação', 'Cobertas'),
    createAsset('cob-stiff', 'Stiffen', 'Laminação', 'Cobertas'),
    createAsset('cob-est', 'Estrutura', 'Laminação', 'Cobertas'),
    createAsset('cob-uniao', 'União Liner/Banheiras', 'Laminação', 'Cobertas'),
    createAsset('cob-base', 'Basecoat', 'Laminação', 'Cobertas'),
    createAsset('cob-pop', 'Pop', 'Laminação', 'Cobertas'),

    createAsset('casc-prep', 'Preparação', 'Laminação', 'Cascos'),
    createAsset('casc-cab', 'Cabine de Pintura', 'Laminação', 'Cascos'),
    createAsset('casc-rep', 'Repassagem', 'Laminação', 'Cascos'),
    createAsset('casc-skin', 'Skin', 'Laminação', 'Cascos'),
    createAsset('casc-lam1', 'Lam 1', 'Laminação', 'Cascos'),
    createAsset('casc-lam2', 'Lam 2', 'Laminação', 'Cascos'),
    createAsset('casc-tramp', 'Trampson/Espumas', 'Laminação', 'Cascos'),
    createAsset('casc-marc', 'Marcação', 'Laminação', 'Cascos'),
    createAsset('casc-stiff', 'Stiffen', 'Laminação', 'Cascos'),
    createAsset('casc-est', 'Estrutura', 'Laminação', 'Cascos'),
    createAsset('casc-top', 'Topcoat', 'Laminação', 'Cascos'),
    createAsset('casc-pop', 'Pop', 'Laminação', 'Cascos'),

    createAsset('lin-prep', 'Preparação', 'Laminação', 'Liners'),
    createAsset('lin-cab', 'Cabine de Pintura', 'Laminação', 'Liners'),
    createAsset('lin-rep', 'Repassagem', 'Laminação', 'Liners'),
    createAsset('lin-skin', 'Skin', 'Laminação', 'Liners'),
    createAsset('lin-marc', 'Marcação', 'Laminação', 'Liners'),
    createAsset('lin-stiff', 'Stiffen', 'Laminação', 'Liners'),
    createAsset('lin-est', 'Estrutura', 'Laminação', 'Liners'),
    createAsset('lin-base', 'Basecoat', 'Laminação', 'Liners'),
    createAsset('lin-pop', 'Pop', 'Laminação', 'Liners'),

    createAsset('sm-prep', 'Preparação', 'Laminação', 'Small Parts'),
    createAsset('sm-cab', 'Cabine de Pintura', 'Laminação', 'Small Parts'),
    createAsset('sm-rep', 'Repassagem', 'Laminação', 'Small Parts'),
    createAsset('sm-skin', 'Skin', 'Laminação', 'Small Parts'),
    createAsset('sm-col', 'Colagem', 'Laminação', 'Small Parts'),
    createAsset('sm-stiff', 'Stiffen', 'Laminação', 'Small Parts'),
    createAsset('sm-base', 'Basecoat', 'Laminação', 'Small Parts'),
    createAsset('sm-pop', 'Pop', 'Laminação', 'Small Parts'),

    createAsset('cort-casc-marc', 'Marcação', 'Corte', 'Casco'),
    createAsset('cort-casc-cab', 'Cabine de Corte', 'Corte', 'Casco'),

    createAsset('prod-g-office', 'Escritório Produção', 'Produção', 'Geral'),
    createAsset('prod-g-meet', 'Sala de Reunião', 'Produção', 'Geral'),

    createAsset('log-emp-01', 'Empilhador 01', 'Logística', 'Armazém'),
    createAsset('log-emp-02', 'Empilhador 02', 'Logística', 'Expedição'),
    createAsset('log-recep', 'Área de Recepção', 'Logística', 'Recepção'),

    createAsset('qual-lab', 'Laboratório', 'Qualidade', 'Laboratório'),
    createAsset('qual-insp', 'Área de Inspeção Final', 'Qualidade', 'Inspeção'),
    createAsset('qual-aud', 'Audit Room', 'Qualidade', 'Auditoria'),
];

const modelCodes = [
    "C21I00000", "C21000000", "D59OBLEG0", "D59OB00SA", "D65A000SA", "D70A000SA", "D77A000SA",
    "S45OBLEG0", "S45OB00SA", "S53OBLEG0", "S53OB0000", "S59OBLEG0", "S59OB00SA", "S65A000SA",
    "T23EXOBUS", "T23PHUS00", "T25EXOBUS", "T25PHUS00", "T53OBLEG0", "T53OB0000", "T59OBLEG0",
    "T59OB00SA", "T65A000SA", "VR4E00000", "VR4OEUS00", "VR4OE0000", "V20I00000", "V20000000",
    "15EL00000", "17ELUS000", "17EL00000", "18ELUS000", "19EL00000", "455OPEN00", "475AXESS0",
    "505CAB000", "505OPEN00", "525AXESS0", "555CAB000", "555NBR000", "555OPEN00", "605CR0000",
    "605NBR000", "605OPEN00", "605SUND00", "625WPH000", "675BR0000", "675CR0000", "675OPEN00",
    "675SUND00", "705OPEN00", "705WE0000", "705WPH000", "755CR0000", "755SUND00", "755WEOB00",
    "805CR0000", "805OPEN00", "805WEOB00", "805WFS000", "805WPH000", "875SUND00", "905WEOB00"
];

const initialProducts: ProductModel[] = modelCodes.map(code => ({
    id: code,
    name: code,
    description: 'Modelo Padrão'
}));

interface ShopfloorState {
    assets: Asset[];
    products: ProductModel[];
    routings: Routing[];
    orders: ProductionOrder[];
    events: ProductionEvent[];
    employees: Employee[];
    absenteeismRecords: AbsenteeismRecord[];

    // Shopfloor 3.0 Data
    productOptions: ProductOption[];
    optionTasks: OptionTask[];
    taskExecutions: TaskExecution[];
    orderIssues: OrderIssue[];

    // Shopfloor V5 (Quality & Scrap)
    qualityCases: QualityCase[];
    qualityActions: QualityAction[];
    scrapReports: ScrapReport[];

    addAsset: (asset: Asset) => void;
    updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
    removeAsset: (id: string) => Promise<void>;
    updateAssetStatus: (id: string, status: Asset['status']) => void;
    addProduct: (product: ProductModel) => void;
    updateProduct: (id: string, updates: Partial<ProductModel>) => Promise<void>;
    removeProduct: (id: string) => Promise<void>;
    createOrder: (order: ProductionOrder) => void;
    updateOrderStatus: (id: string, status: ProductionOrder['status']) => void;

    // Shopfloor Actions
    logEvent: (event: ProductionEvent) => void;
    startOperation: (orderId: string, assetId: string) => Promise<void>;
    stopOperation: (orderId: string, assetId: string, reason?: string, shouldCompleteOrder?: boolean) => Promise<void>;

    // Order Management Actions
    updateOrder: (id: string, updates: Partial<ProductionOrder>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;

    // Shopfloor 3.0 Actions
    addOption: (option: ProductOption) => Promise<void>;
    updateOption: (id: string, updates: Partial<ProductOption>) => Promise<void>;
    removeOption: (id: string) => Promise<void>;

    addTask: (task: OptionTask) => Promise<void>;
    updateTask: (id: string, updates: Partial<OptionTask>) => Promise<void>;
    removeTask: (id: string) => Promise<void>;
    toggleTask: (orderId: string, taskId: string, isCompleted: boolean, userId: string) => Promise<void>;
    reportIssue: (issue: OrderIssue) => Promise<void>;
    resolveIssue: (issueId: string, resolvedBy: string) => Promise<void>;

    // Shopfloor V5 Actions
    addQualityCase: (qCase: QualityCase) => Promise<{ error: any }>;
    updateQualityCase: (id: string, updates: Partial<QualityCase>) => Promise<void>;
    addQualityAction: (action: QualityAction) => Promise<void>;
    updateQualityAction: (id: string, updates: Partial<QualityAction>) => Promise<void>;
    addScrapReport: (report: ScrapReport) => Promise<void>;

    addEmployee: (employee: Employee) => Promise<void>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
    removeEmployee: (id: string) => Promise<void>;
    addAbsenteeismRecord: (record: AbsenteeismRecord) => Promise<void>;
    removeAbsenteeismRecord: (id: string) => Promise<void>;

    // Shopfloor V7 Actions (Tools)
    tools: Tool[];
    toolTransactions: ToolTransaction[];
    toolMaintenances: ToolMaintenance[];

    addTool: (tool: Tool) => Promise<void>;
    updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
    removeTool: (id: string) => Promise<void>;
    addToolTransaction: (transaction: ToolTransaction) => Promise<void>;
    addToolMaintenance: (maintenance: ToolMaintenance) => Promise<void>;
    updateToolMaintenance: (id: string, updates: Partial<ToolMaintenance>) => Promise<void>;

    syncData: () => Promise<void>;

    // Shopfloor V8 (Consumables)
    consumableTransactions: ConsumableTransaction[];
    costCenterMappings: CostCenterMapping[];
    ppeRequests: PpeRequest[];
    addCostCenterMapping: (mapping: CostCenterMapping) => Promise<void>;
    updateCostCenterMapping: (id: string, updates: Partial<CostCenterMapping>) => Promise<void>;
    importConsumablesBatch: (transactions: ConsumableTransaction[]) => Promise<void>;
    addPpeRequest: (req: PpeRequest) => Promise<void>;
    updatePpeRequest: (id: string, updates: Partial<PpeRequest>) => Promise<void>;
}

const mapDbToEmployee = (dbEmp: any): Employee => ({
    id: dbEmp.id,
    workerNumber: dbEmp.worker_number,
    name: dbEmp.name,
    contractType: dbEmp.contract_type,
    jobTitle: dbEmp.job_title || '',
    group: dbEmp["group"],
    area: dbEmp.area,
    workstation: dbEmp.workstation,
    shift: dbEmp.shift,
    supervisor: dbEmp.supervisor,
    leader: dbEmp.leader,
    manager: dbEmp.manager,
    admissionDate: dbEmp.admission_date,
    contractStartDate: dbEmp.contract_start_date || '',
    terminationDate: '',
    birthday: dbEmp.birthday,
    talentMatrix: dbEmp.talent_matrix || '',
    iluo: 'I',
    hrStatus: dbEmp.status || 'active',
    hrNotes: '',
    hasSystemAccess: !!dbEmp.system_access,
    systemAccess: dbEmp.system_access || undefined
});

const mapDbToAbsenteeism = (dbAbs: any): AbsenteeismRecord => ({
    id: dbAbs.id,
    employeeId: dbAbs.employee_id,
    date: dbAbs.date,
    type: dbAbs.type as any,
    durationMinutes: dbAbs.duration_minutes,
    timestamp: dbAbs.created_at || new Date().toISOString() // Fallback to now if missing
});

const mapDbToAsset = (db: any): Asset => ({
    id: db.id,
    name: db.name,
    type: db.type,
    area: db.area,
    subarea: db.subarea,
    status: db.status as any,
    capabilities: db.capabilities || [],
    defaultCycleTime: db.default_cycle_time,
    sequence: db.sequence
});

const mapDbToProduct = (db: any): ProductModel => ({
    id: db.id,
    name: db.name,
    description: db.description,
    operations: db.operations || []
});

const mapDbToOrder = (db: any): ProductionOrder => ({
    id: db.id,
    productModelId: db.product_model_id,
    quantity: db.quantity,
    status: db.status as any,
    po: db.po,
    customer: db.customer,
    area: db.area, // Legacy
    assetId: db.asset_id, // Primary (Legacy V3)
    assetIds: [], // To be populated via Pivot
    startDate: db.start_date ? new Date(db.start_date) : undefined,
    finishDate: db.finish_date ? new Date(db.finish_date) : undefined,
    activeOperations: db.active_operations as any
});

const mapDbToOption = (db: any): ProductOption => ({
    id: db.id,
    name: db.name,
    productModelId: db.product_model_id,
    description: db.description
});

const mapDbToTask = (db: any): OptionTask => ({
    id: db.id,
    optionId: db.option_id,
    description: db.description,
    sequence: db.sequence,
    pdfUrl: db.pdf_url,
    stationId: db.station_id
});

const mapDbToExecution = (db: any): TaskExecution => ({
    orderId: db.order_id,
    taskId: db.task_id,
    completedAt: db.completed_at,
    completedBy: db.completed_by
});

const mapDbToIssue = (db: any): OrderIssue => ({
    id: db.id,
    orderId: db.order_id,
    stationId: db.station_id,
    relatedStationId: db.related_station_id,
    type: db.type,
    description: db.description,
    status: db.status,
    createdAt: db.created_at,
    resolvedAt: db.resolved_at,
    resolvedBy: db.resolved_by
});

const mapDbToEvent = (db: any): ProductionEvent => ({
    id: db.id,
    orderId: db.order_id,
    operationId: db.operation_id,
    assetId: db.asset_id,
    type: db.type as any,
    timestamp: db.timestamp,
    reason: db.reason
});

const mapDbToCostCenter = (db: any): CostCenterMapping => ({
    id: db.id,
    customerCode: db.customer_code,
    description: db.description,
    assetId: db.asset_id
});

const mapDbToConsumable = (db: any): ConsumableTransaction => ({
    id: db.id,
    importId: db.import_id,
    date: db.date,
    week: db.week,
    orderNumber: db.order_number,
    imsNumber: db.ims_number,
    customerCode: db.customer_code,
    areaSource: db.area_source,
    prodLine: db.prod_line ? db.prod_line.trim().toUpperCase() : '',
    partNumber: db.part_number,
    partDescription: db.part_description,
    quantity: db.quantity,
    unitCost: db.unit_cost,
    extensionCost: db.extension_cost,
    userAs400: db.user_as400,
    mappedAssetId: db.mapped_asset_id,
    mappedEmployeeId: db.mapped_employee_id
});

// V5 Helpers
const mapDbToQualityCase = (db: any): QualityCase => ({
    id: db.id,
    orderId: db.order_id,
    assetId: db.asset_id,
    description: db.description,
    type: db.type,
    severity: db.severity,
    status: db.status,
    methodology: db.methodology,
    methodologyData: db.methodology_data,
    createdAt: db.created_at,
    createdBy: db.created_by
});

const mapDbToQualityAction = (db: any): QualityAction => ({
    id: db.id,
    caseId: db.case_id,
    description: db.description,
    responsible: db.responsible,
    deadline: db.deadline,
    status: db.status,
    completedAt: db.completed_at
});

const mapDbToToolMaintenance = (db: any): ToolMaintenance => ({
    id: db.id,
    toolId: db.tool_id,
    description: db.description,
    status: db.status,
    cost: db.cost,
    replacementRequested: db.replacement_requested,
    technicianNotes: db.technician_notes,
    createdAt: db.created_at,
    completedAt: db.completed_at
});

const mapDbToScrapReport = (db: any): ScrapReport => ({
    id: db.id,
    orderId: db.order_id,
    assetId: db.asset_id,
    reportedBy: db.reported_by,
    type: db.type,
    itemDescription: db.item_description,
    quantity: db.quantity,
    reason: db.reason,
    actionTaken: db.action_taken,
    replacementOrderId: db.replacement_order_id,
    createdAt: db.created_at
});

const mapDbToPpeRequest = (db: any): PpeRequest => ({
    id: db.id,
    employeeId: db.employee_id,
    assetId: db.asset_id,
    itemName: db.item_name,
    partNumber: db.part_number,
    quantity: db.quantity,
    unitCost: db.unit_cost,
    status: db.status,
    requestDate: db.request_date,
    processedAt: db.processed_at,
    processedBy: db.processed_by,
    notes: db.notes
});

export const useShopfloorStore = create<ShopfloorState>()(
    persist(
        (set, get) => ({
            // Master Data
            assets: [], // Start Empty (Wait for Sync)
            products: [], // Start Empty (Wait for Sync)
            routings: [],

            // Execution Data
            orders: [],
            events: [],
            employees: [], // Start empty, syncData fills it
            absenteeismRecords: [],

            // Shopfloor 3.0
            productOptions: [],
            optionTasks: [],
            taskExecutions: [],
            orderIssues: [],

            // Shopfloor V5
            qualityCases: [],
            qualityActions: [],
            scrapReports: [],

            // Shopfloor V7 (Tools)
            tools: [],
            toolTransactions: [],

            toolMaintenances: [],

            // Shopfloor V8
            consumableTransactions: [],

            costCenterMappings: [],
            ppeRequests: [],

            // Actions
            addAsset: async (asset) => {
                set((state) => ({ assets: [...state.assets, asset] }));
                const { error } = await supabase.from('assets').insert({
                    id: asset.id,
                    name: asset.name,
                    type: asset.type,
                    area: asset.area,
                    subarea: asset.subarea,
                    status: asset.status,
                    capabilities: asset.capabilities,
                    default_cycle_time: asset.defaultCycleTime,
                    sequence: asset.sequence
                });
                if (error) console.error("Error adding asset DB:", error);
            },

            updateAsset: async (id, updates) => {
                set((state) => ({
                    assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a)
                }));
                const toUpdate: any = {};
                if (updates.name) toUpdate.name = updates.name;
                if (updates.type) toUpdate.type = updates.type;
                if (updates.area) toUpdate.area = updates.area;
                if (updates.subarea) toUpdate.subarea = updates.subarea;
                if (updates.status) toUpdate.status = updates.status;
                if (updates.defaultCycleTime !== undefined) toUpdate.default_cycle_time = updates.defaultCycleTime;

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('assets').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating asset DB:", error);
                }
            },

            removeAsset: async (id) => {
                set((state) => ({
                    assets: state.assets.filter(a => a.id !== id)
                }));
                const { error } = await supabase.from('assets').delete().eq('id', id);
                if (error) console.error("Error removing asset DB:", error);
            },

            updateAssetStatus: async (id, status) => {
                set((state) => ({
                    assets: state.assets.map(a => a.id === id ? { ...a, status } : a)
                }));
                const { error } = await supabase.from('assets').update({ status }).eq('id', id);
                if (error) console.error("Error updating asset status DB:", error);
            },

            addProduct: async (product) => {
                set((state) => ({ products: [...state.products, product] }));
                const { error } = await supabase.from('products').insert({
                    id: product.id,
                    name: product.name,
                    description: product.description
                });
                if (error) console.error("Error adding product DB:", error);
            },

            updateProduct: async (id, updates) => {
                set((state) => ({
                    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
                }));
                const toUpdate: any = {};
                if (updates.name) toUpdate.name = updates.name;
                if (updates.description) toUpdate.description = updates.description;
                if (updates.operations) toUpdate.operations = updates.operations;

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('products').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating product DB:", error);
                }
            },

            removeProduct: async (id) => {
                set((state) => ({
                    products: state.products.filter(p => p.id !== id)
                }));
                await supabase.from('products').delete().eq('id', id);
            },

            createOrder: async (order) => {
                set((state) => ({ orders: [...state.orders, order] }));

                // 1. Insert Order
                const { error } = await supabase.from('orders').insert({
                    id: order.id,
                    product_model_id: order.productModelId,
                    quantity: order.quantity,
                    status: order.status,
                    po: order.po,
                    customer: order.customer,
                    area: order.area, // Legacy
                    asset_id: order.assetId, // New
                    start_date: order.startDate || null,
                    finish_date: order.finishDate || null,
                    active_operations: order.activeOperations || []
                });
                if (error) console.error("Error creating order DB:", error);

                // 2. Insert Selected Options (Pivot)
                if (order.selectedOptions && order.selectedOptions.length > 0) {
                    const pivotData = order.selectedOptions.map(optId => ({
                        order_id: order.id,
                        option_id: optId
                    }));
                    const { error: pivotError } = await supabase.from('production_order_options').insert(pivotData);
                    if (pivotError) console.error("Error linking options to order:", pivotError);
                }

                // 3. Insert Selected Assets (Pivot - Shopfloor 4.0)
                if (order.assetIds && order.assetIds.length > 0) {
                    const assetPivot = order.assetIds.map(aId => ({
                        order_id: order.id,
                        asset_id: aId
                    }));
                    const { error: assetError } = await supabase.from('production_order_assets').insert(assetPivot);
                    if (assetError) console.error("Error linking assets to order:", assetError);
                }
            },

            updateOrderStatus: async (id, status) => {
                set((state) => ({
                    orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
                }));
                const { error } = await supabase.from('orders').update({ status }).eq('id', id);
                if (error) console.error("Error updating order status DB:", error);
                if (error) console.error("Error updating order status DB:", error);
            },

            updateOrder: async (id, updates) => {
                set((state) => ({
                    orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o)
                }));
                const toUpdate: any = {};
                // Map frontend fields back to DB columns if needed
                if (updates.quantity) toUpdate.quantity = updates.quantity;
                if (updates.po) toUpdate.po = updates.po;
                if (updates.customer) toUpdate.customer = updates.customer;
                if (updates.startDate) toUpdate.start_date = updates.startDate;
                if (updates.finishDate) toUpdate.finish_date = updates.finishDate;
                if (updates.assetId) toUpdate.asset_id = updates.assetId;
                if (updates.status) toUpdate.status = updates.status;

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('orders').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating order DB:", error);
                }
            },

            deleteOrder: async (id) => {
                set((state) => ({
                    orders: state.orders.filter(o => o.id !== id)
                }));
                // Cascade delete should handle related items in DB, or we delete here manually
                // For now assuming basic delete
                const { error } = await supabase.from('orders').delete().eq('id', id);
                if (error) console.error("Error deleting order DB:", error);
            },

            logEvent: async (event) => {
                set((state) => ({ events: [...state.events, event] }));
                const { error } = await supabase.from('events').insert({
                    id: event.id,
                    order_id: event.orderId,
                    operation_id: event.operationId,
                    asset_id: event.assetId,
                    type: event.type,
                    timestamp: event.timestamp,
                    reason: event.reason
                });
                if (error) console.error("Error logging event DB:", error);
            },

            startOperation: async (orderId, assetId) => {
                const event: ProductionEvent = {
                    id: `evt-${Date.now()}`,
                    orderId,
                    assetId,
                    type: 'START',
                    timestamp: new Date().toISOString()
                };

                // 1. Log Start Event
                get().logEvent(event);

                // 2. Update Asset Status to in_use and Order Status to in_progress
                get().updateAssetStatus(assetId, 'in_use');
                const order = get().orders.find(o => o.id === orderId);
                if (order && order.status === 'planned') {
                    get().updateOrderStatus(orderId, 'in_progress');
                }
            },

            stopOperation: async (orderId, assetId, reason, shouldCompleteOrder = false) => {
                const event: ProductionEvent = {
                    id: `evt-${Date.now()}`,
                    orderId,
                    assetId,
                    type: shouldCompleteOrder ? 'COMPLETE' : 'STOP',
                    timestamp: new Date().toISOString(),
                    reason
                };

                // 1. Log Stop Event
                get().logEvent(event);

                // 2. Update Asset Status to available
                get().updateAssetStatus(assetId, 'available');

                // 3. Complete Order if requested
                if (shouldCompleteOrder) {
                    get().updateOrderStatus(orderId, 'completed');
                }
            },

            addEmployee: async (employee) => {
                set((state) => ({ employees: [...state.employees, employee] }));
                const { error } = await supabase.from('employees').insert({
                    id: employee.id,
                    worker_number: employee.workerNumber,
                    name: employee.name,
                    contract_type: employee.contractType,
                    job_title: employee.jobTitle,
                    "group": employee.group,
                    area: employee.area,
                    workstation: employee.workstation,
                    shift: employee.shift,
                    supervisor: employee.supervisor,
                    leader: employee.leader,
                    manager: employee.manager,
                    admission_date: employee.admissionDate || null,
                    birthday: employee.birthday || null,
                    status: employee.hrStatus,
                    contract_start_date: employee.contractStartDate || null,
                    talent_matrix: employee.talentMatrix,
                    system_access: employee.systemAccess
                });
                if (error) console.error("Error adding employee to DB:", error);
            },

            updateEmployee: async (id, updates) => {
                set((state) => ({
                    employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
                }));
                const toUpdate: any = {};
                if (updates.name) toUpdate.name = updates.name;
                if (updates.area) toUpdate.area = updates.area;
                if (updates.manager) toUpdate.manager = updates.manager;
                if (updates.leader) toUpdate.leader = updates.leader;
                if (updates.supervisor) toUpdate.supervisor = updates.supervisor;
                if (updates.jobTitle) toUpdate.job_title = updates.jobTitle;
                if (updates.shift) toUpdate.shift = updates.shift;
                if (updates.hrStatus) toUpdate.status = updates.hrStatus;
                if (updates.contractStartDate) toUpdate.contract_start_date = updates.contractStartDate;
                if (updates.talentMatrix) toUpdate.talent_matrix = updates.talentMatrix;
                if (updates.systemAccess) toUpdate.system_access = updates.systemAccess;

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('employees').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating employee DB:", error);
                }
            },

            removeEmployee: async (id) => {
                set((state) => ({
                    employees: state.employees.filter(e => e.id !== id)
                }));
                await supabase.from('employees').delete().eq('id', id);
            },

            addAbsenteeismRecord: async (record) => {
                set((state) => ({
                    absenteeismRecords: [...state.absenteeismRecords, record]
                }));
                const { error } = await supabase.from('absenteeism_records').insert({
                    id: record.id,
                    employee_id: record.employeeId,
                    date: record.date,
                    type: record.type,
                    duration_minutes: record.durationMinutes || 0
                });
                if (error) console.error("Error adding record DB:", error);
            },

            // --- Shopfloor 3.0 Actions ---
            addOption: async (option) => {
                set(s => ({ productOptions: [...s.productOptions, option] }));
                const { error } = await supabase.from('product_options').insert({
                    id: option.id, product_model_id: option.productModelId, name: option.name, description: option.description
                });
                if (error) console.error("Error adding option:", error);
            },

            addTask: async (task) => {
                set(s => ({ optionTasks: [...s.optionTasks, task] }));
                const { error } = await supabase.from('option_tasks').insert({
                    id: task.id, option_id: task.optionId, description: task.description, sequence: task.sequence, pdf_url: task.pdfUrl, station_id: task.stationId
                });
                if (error) console.error("Error adding task:", error);
            },

            updateTask: async (id, updates) => {
                set(s => ({
                    optionTasks: s.optionTasks.map(t => t.id === id ? { ...t, ...updates } : t)
                }));
                const toUpdate: any = {};
                if (updates.description) toUpdate.description = updates.description;
                if (updates.sequence) toUpdate.sequence = updates.sequence;
                if (updates.pdfUrl) toUpdate.pdf_url = updates.pdfUrl;
                if (updates.stationId) toUpdate.station_id = updates.stationId;

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('option_tasks').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating task:", error);
                }
            },

            removeTask: async (id) => {
                set(s => ({ optionTasks: s.optionTasks.filter(t => t.id !== id) }));
                const { error } = await supabase.from('option_tasks').delete().eq('id', id);
                if (error) console.error("Error deleting task:", error);
            },

            updateOption: async (id, updates) => {
                set(s => ({
                    productOptions: s.productOptions.map(o => o.id === id ? { ...o, ...updates } : o)
                }));
                const toUpdate: any = {};
                if (updates.name) toUpdate.name = updates.name;
                if (updates.description) toUpdate.description = updates.description;
                if (updates.productModelId) toUpdate.product_model_id = updates.productModelId;

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('product_options').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating option:", error);
                }
            },

            removeOption: async (id) => {
                set(s => ({ productOptions: s.productOptions.filter(o => o.id !== id) }));
                const { error } = await supabase.from('product_options').delete().eq('id', id);
                if (error) console.error("Error deleting option:", error);
            },

            toggleTask: async (orderId, taskId, isCompleted, userId) => {
                // Optimistic Update
                const completedAt = isCompleted ? new Date().toISOString() : undefined;
                set(s => {
                    const existing = s.taskExecutions.find(te => te.orderId === orderId && te.taskId === taskId);
                    if (existing) {
                        return {
                            taskExecutions: s.taskExecutions.map(te => te.orderId === orderId && te.taskId === taskId
                                ? { ...te, completedAt, completedBy: userId }
                                : te)
                        };
                    } else {
                        return {
                            taskExecutions: [...s.taskExecutions, { orderId, taskId, completedAt, completedBy: userId }]
                        };
                    }
                });

                if (isCompleted) {
                    await supabase.from('task_executions').upsert({
                        order_id: orderId, task_id: taskId, completed_at: completedAt, completed_by: userId
                    });
                } else {
                    await supabase.from('task_executions').delete().match({ order_id: orderId, task_id: taskId });
                }
            },

            reportIssue: async (issue) => {
                set(s => ({ orderIssues: [...s.orderIssues, issue] }));
                const { error } = await supabase.from('order_issues').insert({
                    id: issue.id, order_id: issue.orderId, station_id: issue.stationId, related_station_id: issue.relatedStationId,
                    type: issue.type, description: issue.description, status: issue.status
                });
                if (error) console.error("Error reporting issue:", error);
            },

            resolveIssue: async (issueId, resolvedBy) => {
                const resolvedAt = new Date().toISOString();
                set(s => ({
                    orderIssues: s.orderIssues.map(i => i.id === issueId ? { ...i, status: 'resolved', resolvedAt, resolvedBy } : i)
                }));
                await supabase.from('order_issues').update({ status: 'resolved', resolved_at: resolvedAt, resolved_by: resolvedBy })
                    .eq('id', issueId);
            },

            // --- Consumables Actions ---
            addCostCenterMapping: async (mapping) => {
                set(s => ({ costCenterMappings: [...s.costCenterMappings, mapping] }));
                const { error } = await supabase.from('cost_center_mappings').insert({
                    id: mapping.id, customer_code: mapping.customerCode, description: mapping.description, asset_id: mapping.assetId
                });
                if (error) console.error("Error adding CC mapping:", error);
            },

            updateCostCenterMapping: async (id, updates) => {
                set(s => ({
                    costCenterMappings: s.costCenterMappings.map(m => m.id === id ? { ...m, ...updates } : m)
                }));
                const toUpdate: any = {};
                if (updates.description) toUpdate.description = updates.description;
                if (updates.assetId !== undefined) {
                    toUpdate.asset_id = updates.assetId === "" ? null : updates.assetId;
                }

                if (Object.keys(toUpdate).length > 0) {
                    const { error } = await supabase.from('cost_center_mappings').update(toUpdate).eq('id', id);
                    if (error) console.error("Error updating CC mapping:", error);
                }
            },

            importConsumablesBatch: async (transactions) => {
                // Optimistic UI update might be too heavy for large batches, so we might skip it or just append
                set(s => ({ consumableTransactions: [...s.consumableTransactions, ...transactions] }));

                const dbTransactions = transactions.map(t => ({
                    id: t.id,
                    import_id: t.importId,
                    date: t.date,
                    week: t.week,
                    order_number: t.orderNumber,
                    ims_number: t.imsNumber,
                    customer_code: t.customerCode,
                    area_source: t.areaSource,
                    prod_line: t.prodLine,
                    part_number: t.partNumber,
                    part_description: t.partDescription,
                    quantity: t.quantity,
                    unit_cost: t.unitCost,
                    extension_cost: t.extensionCost,
                    user_as400: t.userAs400,
                    mapped_asset_id: t.mappedAssetId,
                    mapped_employee_id: t.mappedEmployeeId
                }));

                const { error } = await supabase.from('consumable_transactions').insert(dbTransactions);
                if (error) console.error("Error importing consumables:", error);
                const { error } = await supabase.from('consumable_transactions').insert(dbTransactions);
                if (error) console.error("Error importing consumables:", error);
            },

            addPpeRequest: async (req) => {
                set(s => ({ ppeRequests: [...s.ppeRequests, req] }));
                const { error } = await supabase.from('ppe_requests').insert({
                    id: req.id, employee_id: req.employeeId, asset_id: req.assetId,
                    item_name: req.itemName, part_number: req.partNumber, quantity: req.quantity,
                    unit_cost: req.unitCost, status: req.status, request_date: req.requestDate, notes: req.notes
                });
                if (error) console.error("Error adding PPI request:", error);
            },

            updatePpeRequest: async (id, updates) => {
                set(s => ({
                    ppeRequests: s.ppeRequests.map(r => r.id === id ? { ...r, ...updates } : r)
                }));
                const toUpdate: any = {};
                if (updates.status) toUpdate.status = updates.status;
                if (updates.processedBy) {
                    toUpdate.processed_by = updates.processedBy;
                    toUpdate.processed_at = new Date().toISOString();
                }

                if (Object.keys(toUpdate).length > 0) {
                    await supabase.from('ppe_requests').update(toUpdate).eq('id', id);
                }
            },


            // --- Shopfloor V5 Actions ---
            addQualityCase: async (qCase) => {
                set(s => ({ qualityCases: [...s.qualityCases, qCase] }));
                const { error } = await supabase.from('quality_cases').insert({
                    id: qCase.id, order_id: qCase.orderId, asset_id: qCase.assetId,
                    description: qCase.description, type: qCase.type, severity: qCase.severity,
                    status: qCase.status, methodology: qCase.methodology, methodology_data: qCase.methodologyData
                });
                if (error) {
                    console.error("Error adding quality case:", error);
                    // Revert state if needed, or just let UI handle
                }
                return { error };
            },

            updateQualityCase: async (id, updates) => {
                set(s => ({ qualityCases: s.qualityCases.map(c => c.id === id ? { ...c, ...updates } : c) }));
                const toUpdate: any = {};
                if (updates.status) toUpdate.status = updates.status;
                if (updates.methodology) toUpdate.methodology = updates.methodology;
                if (updates.methodologyData) toUpdate.methodology_data = updates.methodologyData;

                if (Object.keys(toUpdate).length > 0) {
                    await supabase.from('quality_cases').update(toUpdate).eq('id', id);
                }
            },

            addQualityAction: async (action) => {
                set(s => ({ qualityActions: [...s.qualityActions, action] }));
                const { error } = await supabase.from('quality_actions').insert({
                    id: action.id, case_id: action.caseId, description: action.description,
                    responsible: action.responsible, deadline: action.deadline, status: action.status
                });
                if (error) console.error("Error adding quality action:", error);
            },

            updateQualityAction: async (id, updates) => {
                set(s => ({ qualityActions: s.qualityActions.map(a => a.id === id ? { ...a, ...updates } : a) }));
                await supabase.from('quality_actions').update({
                    status: updates.status, completed_at: updates.status === 'completed' ? new Date().toISOString() : null
                }).eq('id', id);
            },

            addScrapReport: async (report) => {
                set(s => ({ scrapReports: [...s.scrapReports, report] }));
                const { error } = await supabase.from('scrap_reports').insert({
                    id: report.id, order_id: report.orderId, asset_id: report.assetId,
                    reported_by: report.reportedBy, type: report.type, item_description: report.itemDescription,
                    quantity: report.quantity, reason: report.reason, action_taken: report.actionTaken,
                    replacement_order_id: report.replacementOrderId
                });
                if (error) console.error("Error adding scrap report:", error);
            },

            removeAbsenteeismRecord: async (id) => {
                set((state) => ({
                    absenteeismRecords: state.absenteeismRecords.filter(r => r.id !== id)
                }));
                await supabase.from('absenteeism_records').delete().eq('id', id);
            },

            // --- Tool Management Actions ---
            addTool: async (tool) => {
                set(s => ({ tools: [...s.tools, tool] }));
                const { error } = await supabase.from('tools').insert({
                    id: tool.id, code: tool.code, name: tool.name, category: tool.category,
                    status: tool.status, condition: tool.condition, current_holder_id: tool.currentHolderId,
                    location: tool.location
                });
                if (error) console.error("Error adding tool:", error);
            },

            updateTool: async (id, updates) => {
                set(s => ({ tools: s.tools.map(t => t.id === id ? { ...t, ...updates } : t) }));
                const toUpdate: any = {};
                if (updates.status) toUpdate.status = updates.status;
                if (updates.currentHolderId !== undefined) toUpdate.current_holder_id = updates.currentHolderId;
                if (updates.condition) toUpdate.condition = updates.condition;
                if (updates.location) toUpdate.location = updates.location;

                await supabase.from('tools').update(toUpdate).eq('id', id);
            },

            removeTool: async (id) => {
                set(s => ({ tools: s.tools.filter(t => t.id !== id) }));
                const { error } = await supabase.from('tools').delete().eq('id', id);
                if (error) console.error("Error deleting tool:", error);
            },

            addToolTransaction: async (tx) => {
                set(s => ({ toolTransactions: [...s.toolTransactions, tx] }));
                const { error } = await supabase.from('tool_transactions').insert({
                    id: tx.id, tool_id: tx.toolId, employee_id: tx.employeeId,
                    action: tx.action, signature: tx.signature, notes: tx.notes, created_by: tx.createdBy
                });
                if (error) console.error("Error adding tool transaction:", error);
            },

            addToolMaintenance: async (m) => {
                set(s => ({ toolMaintenances: [...s.toolMaintenances, m] }));
                const { error } = await supabase.from('tool_maintenance').insert({
                    id: m.id, tool_id: m.toolId, description: m.description,
                    status: m.status, technician_notes: m.technicianNotes
                });
            },

            updateToolMaintenance: async (id, updates) => {
                set(s => ({ toolMaintenances: s.toolMaintenances.map(m => m.id === id ? { ...m, ...updates } : m) }));
                const toUpdate: any = { status: updates.status };
                if (updates.status === 'completed' || updates.status === 'condemned') {
                    toUpdate.completed_at = new Date().toISOString();
                }
                await supabase.from('tool_maintenance').update(toUpdate).eq('id', id);
            },

            syncData: async () => {
                // Employees
                const { data: emps } = await supabase.from('employees').select('*');
                if (emps) set({ employees: emps.map(mapDbToEmployee) });

                // Absenteeism
                const { data: recs } = await supabase.from('absenteeism_records').select('*');
                if (recs) set({ absenteeismRecords: recs.map(mapDbToAbsenteeism) });

                // Assets
                const { data: assets } = await supabase.from('assets').select('*');
                if (assets) set({ assets: assets.map(mapDbToAsset) });

                // Products
                // Products & Routings (Derived from Products)
                const { data: products } = await supabase.from('products').select('*');
                if (products) {
                    set({ products: products.map(mapDbToProduct) });

                    // Generate routings from product operations
                    const derivedRoutings: Routing[] = products
                        .filter(p => p.operations && Array.isArray(p.operations))
                        .map(p => ({
                            id: `rt-${p.id}`,
                            productModelId: p.id,
                            operations: p.operations
                        }));

                    set({ routings: derivedRoutings }); // Always update routings
                }

                // Orders
                const { data: orders } = await supabase.from('orders').select('*');
                if (orders) set({ orders: orders.map(mapDbToOrder) });

                // Events
                const { data: events } = await supabase.from('events').select('*');
                if (events) set({ events: events.map(mapDbToEvent) });

                // Shopfloor 3.0 Data Sync
                const { data: opts } = await supabase.from('product_options').select('*');
                if (opts) set({ productOptions: opts.map(mapDbToOption) });

                const { data: tasks } = await supabase.from('option_tasks').select('*');
                if (tasks) set({ optionTasks: tasks.map(mapDbToTask) });

                const { data: execs } = await supabase.from('task_executions').select('*');
                if (execs) set({ taskExecutions: execs.map(mapDbToExecution) });

                const { data: issues } = await supabase.from('order_issues').select('*');
                if (issues) set({ orderIssues: issues.map(mapDbToIssue) });

                // V5 Sync
                const { data: qCases } = await supabase.from('quality_cases').select('*');
                if (qCases) set({ qualityCases: qCases.map(mapDbToQualityCase) });

                const { data: qActions } = await supabase.from('quality_actions').select('*');
                if (qActions) set({ qualityActions: qActions.map(mapDbToQualityAction) });

                const { data: scrap } = await supabase.from('scrap_reports').select('*');
                if (scrap) set({ scrapReports: scrap.map(mapDbToScrapReport) });

                // V7 Tools Sync
                const { data: tools } = await supabase.from('tools').select('*');
                if (tools) set({
                    tools: tools.map((t: any) => ({
                        id: t.id, code: t.code, name: t.name, category: t.category,
                        status: t.status, condition: t.condition, currentHolderId: t.current_holder_id,
                        location: t.location, purchaseDate: t.purchase_date, lastMaintenance: t.last_maintenance
                    }))
                });

                const { data: toolTxs } = await supabase.from('tool_transactions').select('*');
                if (toolTxs) set({
                    toolTransactions: toolTxs.map((t: any) => ({
                        id: t.id, toolId: t.tool_id, employeeId: t.employee_id,
                        action: t.action, signature: t.signature, notes: t.notes,
                        createdAt: t.created_at, createdBy: t.created_by
                    }))
                });

                // Tool Maintenance
                const { data: toolMaint } = await supabase.from('tool_maintenance').select('*');
                if (toolMaint) set({ toolMaintenances: toolMaint.map(mapDbToToolMaintenance) });

                // Consumables (Limit to recent? For now all)
                const { data: ccMap } = await supabase.from('cost_center_mappings').select('*');
                const { data: ccMap } = await supabase.from('cost_center_mappings').select('*');
                if (ccMap) set({ costCenterMappings: ccMap.map(mapDbToCostCenter) });

                // PPI Requests
                const { data: ppiReqs } = await supabase.from('ppe_requests').select('*');
                if (ppiReqs) set({ ppeRequests: ppiReqs.map(mapDbToPpeRequest) });

                // Check performance here later - maybe only fetch last 3 months
                const { data: consTx } = await supabase.from('consumable_transactions').select('*').order('date', { ascending: false }).limit(2000);
                if (consTx) set({ consumableTransactions: consTx.map(mapDbToConsumable).reverse() });

                // Fetch Order Options Pivot and Map to Orders
                // Fetch Order Options Pivot and Map to Orders
                const { data: pivot } = await supabase.from('production_order_options').select('*');
                const { data: assetPivot } = await supabase.from('production_order_assets').select('*');

                if (orders) {
                    const mappedOrders = orders.map(mapDbToOrder).map(o => {
                        const myOptions = pivot ? pivot.filter((p: any) => p.order_id === o.id).map((p: any) => p.option_id) : [];

                        const myAssets = assetPivot
                            ? assetPivot.filter((p: any) => p.order_id === o.id).map((p: any) => p.asset_id)
                            : [];

                        // Fallback to legacy assetId if no pivot data
                        if (myAssets.length === 0 && o.assetId) {
                            myAssets.push(o.assetId);
                        }

                        return {
                            ...o,
                            selectedOptions: myOptions,
                            assetIds: myAssets
                        };
                    });

                    set({ orders: mappedOrders });
                }
            },
        }),
        {
            name: 'shopfloor-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                orders: state.orders,
                events: state.events,
                assets: state.assets,
                products: state.products
            }),
        }
    ));
