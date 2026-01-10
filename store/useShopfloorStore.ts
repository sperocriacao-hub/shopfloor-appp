
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    Asset, ProductModel, Routing, ProductionOrder, ProductionEvent, Employee,
    OrderStatus, AssetStatus, AbsenteeismRecord,
    ProductOption, OptionTask, OrderIssue, TaskExecution
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

    addEmployee: (employee: Employee) => Promise<void>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
    removeEmployee: (id: string) => Promise<void>;
    addAbsenteeismRecord: (record: AbsenteeismRecord) => Promise<void>;
    removeAbsenteeismRecord: (id: string) => Promise<void>;
    syncData: () => Promise<void>;
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
    defaultCycleTime: db.default_cycle_time
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
                    default_cycle_time: asset.defaultCycleTime
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

            removeAbsenteeismRecord: async (id) => {
                set((state) => ({
                    absenteeismRecords: state.absenteeismRecords.filter(r => r.id !== id)
                }));
                await supabase.from('absenteeism_records').delete().eq('id', id);
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
