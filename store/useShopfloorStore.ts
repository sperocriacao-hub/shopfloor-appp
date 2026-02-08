
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    Asset, ProductModel, Routing, ProductionOrder, ProductionEvent, Employee,
    OrderStatus, AssetStatus, AbsenteeismRecord,
    ProductOption, OptionTask, OrderIssue, TaskExecution,
    QualityCase, QualityAction, ScrapReport,
    Tool, ToolTransaction, ToolMaintenance,
    ConsumableTransaction, CostCenterMapping, PpeRequest, PpeRequestItem, MaterialRequest,
    ProductionLine, SequencingRule, Alert,
    MoldCompatibility, MoldMaintenanceLog,
    ProductPart, OrderPart,
    RfidReader, IotEvent,
    MaintenanceOrder, MaintenancePin, MoldGeometry,
    UserSettings, UserPermissions, AuditLog, EmployeeWithPermissions, AppModule,
    DailyEvaluation, Certification, EmployeeCertification, SafetyIncident, SafetyInspection, ScrapTransaction
} from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

    // Shopfloor 3.0
    productOptions: ProductOption[];
    optionTasks: OptionTask[];
    taskExecutions: TaskExecution[];
    orderIssues: OrderIssue[];

    // Shopfloor V5 (Quality & Scrap)
    qualityCases: QualityCase[];
    qualityActions: QualityAction[];
    scrapReports: ScrapReport[];

    // Shopfloor V6 (Engineering)
    productionLines: ProductionLine[];
    sequencingRules: SequencingRule[];
    moldCompatibility: MoldCompatibility[]; // Shopfloor V6
    moldMaintenanceLogs: MoldMaintenanceLog[]; // Shopfloor V6

    // Shopfloor V14 (Scrap & AS400)
    scrapTransactions: ScrapTransaction[];
    addScrapTransaction: (tx: ScrapTransaction) => Promise<void>;
    updateScrapTransaction: (id: string, updates: Partial<ScrapTransaction>) => Promise<void>;
    importAS400Data: (type: 'products' | 'consumables', data: any[]) => Promise<void>;

    addMoldCompatibility: (pair: MoldCompatibility) => Promise<void>;
    removeMoldCompatibility: (id: string) => Promise<void>;
    addMoldMaintenanceLog: (log: MoldMaintenanceLog) => Promise<void>;
    updateMoldMaintenanceLog: (id: string, updates: Partial<MoldMaintenanceLog>) => Promise<void>;

    // Shopfloor V7 (Parts)
    productParts: ProductPart[];
    orderParts: OrderPart[];
    addProductPart: (part: ProductPart) => Promise<void>;
    addOrderPart: (part: OrderPart) => Promise<void>;
    updateOrderPart: (id: string, updates: Partial<OrderPart>) => Promise<void>;

    // Shopfloor IoT - Andon
    alerts: Alert[];
    triggerAndon: (alert: Alert) => Promise<void>;
    resolveAndon: (id: string, resolvedBy: string) => Promise<void>;

    // Shopfloor IoT - Hardware (RFID Readers)
    rfidReaders: RfidReader[];
    iotEvents: IotEvent[];
    addRfidReader: (reader: RfidReader) => void;
    updateRfidReader: (id: string, updates: Partial<RfidReader>) => void;
    deleteRfidReader: (id: string) => void;
    logIotEvent: (event: IotEvent) => void;
    clearIotEvents: () => void;

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

    // Material Requests (Requests V2)
    materialRequests: MaterialRequest[];
    addMaterialRequest: (req: MaterialRequest) => Promise<void>;
    updateMaterialRequest: (id: string, updates: Partial<MaterialRequest>) => Promise<void>;

    // Shopfloor V6 Actions
    addProductionLine: (line: ProductionLine) => Promise<void>;
    updateProductionLine: (id: string, updates: Partial<ProductionLine>) => Promise<void>;
    addSequencingRule: (rule: SequencingRule) => Promise<void>;
    updateSequencingRule: (id: string, updates: Partial<SequencingRule>) => Promise<void>;
    deleteSequencingRule: (id: string) => Promise<void>;

    // Shopfloor V6 IoT Actions
    findAssetByRfid: (tag: string) => Asset | undefined; // Synchronous lookups from loaded state preferred for speed
    findEmployeeByRfid: (tag: string) => Employee | undefined;
    findStationByFixedId: (fixedId: string) => Asset | undefined;

    // Shopfloor V8 Actions (Mold Maintenance)
    maintenanceOrders: MaintenanceOrder[];
    moldGeometries: MoldGeometry[];
    addMaintenanceOrder: (order: MaintenanceOrder) => void;
    updateMaintenanceOrder: (id: string, updates: Partial<MaintenanceOrder>) => void;
    addMaintenancePin: (pin: MaintenancePin) => void;
    updateMaintenancePin: (id: string, updates: Partial<MaintenancePin>) => void;
    setMoldGeometries: (geometries: MoldGeometry[]) => void;

    // --- Shopfloor V13: HR & HST ---
    dailyEvaluations: DailyEvaluation[];
    certifications: Certification[];
    employeeCertifications: EmployeeCertification[];
    safetyIncidents: SafetyIncident[];
    safetyInspections: SafetyInspection[];

    addEvaluation: (evaluation: DailyEvaluation) => void;
    addCertification: (certification: Certification) => void;
    assignCertification: (empCert: EmployeeCertification) => void;
    reportIncident: (incident: SafetyIncident) => void;
    updateIncident: (id: string, updates: Partial<SafetyIncident>) => void;
    addInspection: (inspection: SafetyInspection) => void;

    // --- Shopfloor V9: IAM Actions ---
    currentUser: EmployeeWithPermissions | null;
    auditLogs: AuditLog[];
    login: (user: EmployeeWithPermissions) => void;
    logout: () => void;
    updateUserPermissions: (userId: string, permissions: UserPermissions) => void;
    updateUserSettings: (settings: Partial<UserSettings>) => void;
    logAudit: (action: string, module: string, description: string) => void;
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
    rfidTag: dbEmp.rfid_tag,
    hasSystemAccess: !!dbEmp.system_access,
    systemAccess: dbEmp.system_access || undefined,
    role: dbEmp.role || 'operator',
    permissions: dbEmp.permissions || {},
    settings: dbEmp.settings || {}
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
    sequence: db.sequence,
    rfidTag: db.rfid_tag,
    locationFixedId: db.location_fixed_id
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
    stationId: db.station_id,
    pdfUrl: db.pdf_url,
    standardTimeMinutes: db.standard_time_minutes
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
    mappedArea: db.mapped_area // Changed from assetId
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
    images: db.images || [],
    dueDate: db.due_date,
    notes: db.notes,
    createdAt: db.created_at,
    createdBy: db.created_by
});

const mapDbToMoldCompatibility = (db: any): MoldCompatibility => ({
    id: db.id,
    hullMoldId: db.hull_mold_id,
    deckMoldId: db.deck_mold_id,
    compatibilityScore: db.compatibility_score,
    notes: db.notes
});

const mapDbToMoldMaintenanceLog = (db: any): MoldMaintenanceLog => ({
    id: db.id,
    moldId: db.mold_id,
    description: db.description,
    severity: db.severity,
    status: db.status,
    images: db.images,
    technicianId: db.technician_id,
    createdAt: db.created_at,
    resolvedAt: db.resolved_at
});

const mapDbToAlert = (db: any): Alert => ({
    id: db.id,
    stationId: db.station_id,
    type: db.type,
    description: db.description,
    status: db.status,
    createdAt: db.created_at,
    resolvedAt: db.resolved_at,
    resolvedBy: db.resolved_by
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

const mapDbToMaterialRequest = (db: any): MaterialRequest => ({
    id: db.id,
    area: db.area,
    status: db.status,
    requestDate: db.request_date,
    items: db.items || [],
    totalCost: db.total_cost || 0,
    processedAt: db.processed_at,
    processedBy: db.processed_by
});

const mapDbToScrapTransaction = (db: any): ScrapTransaction => ({
    id: db.id,
    date: db.date,
    partNumber: db.part_number,
    partDescription: db.part_description,
    quantity: db.quantity,
    reasonCode: db.reason_code,
    costCenter: db.cost_center,
    unitCost: db.unit_cost,
    totalCost: db.total_cost,
    status: db.status,
    reportedBy: db.reported_by,
    approvedBy: db.approved_by,
    exportedAt: db.exported_at,
    notes: db.notes
});

const mapDbToLine = (db: any): ProductionLine => ({
    id: db.id,
    description: db.description,
    dailyCapacity: db.daily_capacity,
    allowedModels: db.allowed_models || [],
    active: db.active
});

const mapDbToRule = (db: any): SequencingRule => ({
    id: db.id,
    productModelId: db.product_model_id,
    areaId: db.area_id,
    offsetDays: db.offset_days,
    durationDays: db.duration_days,
    dependencyAreaId: db.dependency_area_id
});

export const useShopfloorStore = create<ShopfloorState>()(
    persist(
        (set, get) => ({
            // Master Data
            assets: [], // Start Empty (Wait for Sync)
            products: [], // Start Empty (Wait for Sync)
            routings: [],

            // Shopfloor V9 (IAM)
            currentUser: null,
            auditLogs: [],
            // V13 HR/HST
            dailyEvaluations: [],
            certifications: [],
            employeeCertifications: [],
            safetyIncidents: [],
            safetyInspections: [],

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
            scrapTransactions: [],

            // Shopfloor V7 (Tools)
            tools: [],
            toolTransactions: [],

            toolMaintenances: [],

            // Shopfloor V8
            consumableTransactions: [],

            costCenterMappings: [],
            ppeRequests: [],
            materialRequests: [],

            // Shopfloor V6
            productionLines: [],
            sequencingRules: [],
            productParts: [],
            orderParts: [],
            moldCompatibility: [],
            moldMaintenanceLogs: [],
            alerts: [],

            // Shopfloor V8 (Mold Maintenance)
            maintenanceOrders: [],
            moldGeometries: [],

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
                    sequence: asset.sequence,
                    rfid_tag: asset.rfidTag,
                    location_fixed_id: asset.locationFixedId
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
                if (updates.rfidTag) toUpdate.rfid_tag = updates.rfidTag;
                if (updates.locationFixedId) toUpdate.location_fixed_id = updates.locationFixedId;

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
                    production_line_id: order.productionLineId,
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

                const payload = {
                    id: employee.id,
                    worker_number: employee.workerNumber,
                    name: employee.name,
                    contract_type: employee.contractType,
                    job_title: employee.jobTitle,
                    group: employee.group,
                    area: employee.area,
                    workstation: employee.workstation,
                    shift: employee.shift,
                    supervisor: employee.supervisor,
                    leader: employee.leader,
                    manager: employee.manager,
                    admission_date: employee.admissionDate || null,
                    contract_start_date: employee.contractStartDate || null,
                    birthday: employee.birthday || null,
                    talent_matrix: employee.talentMatrix,
                    status: employee.hrStatus,
                    hr_notes: employee.hrNotes,
                    system_access: employee.hasSystemAccess,
                    rfid_tag: employee.rfidTag,
                    // IAM V9
                    role: employee.role,
                    permissions: employee.permissions,
                    settings: employee.settings
                };

                const { error } = await supabase.from('employees').insert(payload);
                if (error) console.error("Error adding employee to DB:", error);
            },

            updateEmployee: async (id, updates) => {
                console.log(`[ShopfloorStore] Updating employee ${id}`, updates);
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
                if (updates.rfidTag) toUpdate.rfid_tag = updates.rfidTag;
                // IAM V9
                if (updates.role) toUpdate.role = updates.role;
                if (updates.permissions) toUpdate.permissions = updates.permissions;
                if (updates.settings) toUpdate.settings = updates.settings;

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
                set((state) => ({ optionTasks: [...state.optionTasks, task] }));
                const { error } = await supabase.from('option_tasks').insert({
                    id: task.id,
                    option_id: task.optionId,
                    description: task.description,
                    sequence: task.sequence,
                    station_id: task.stationId,
                    pdf_url: task.pdfUrl,
                    standard_time_minutes: task.standardTimeMinutes || 0
                });
                if (error) console.error("Error adding option task:", error);
            },

            updateTask: async (id, updates) => {
                set((state) => ({
                    optionTasks: state.optionTasks.map(t => t.id === id ? { ...t, ...updates } : t)
                }));
                const toUpdate: any = {};
                if (updates.description) toUpdate.description = updates.description;
                if (updates.sequence) toUpdate.sequence = updates.sequence;
                if (updates.pdfUrl) toUpdate.pdf_url = updates.pdfUrl;
                if (updates.stationId) toUpdate.station_id = updates.stationId;
                if (updates.standardTimeMinutes !== undefined) toUpdate.standard_time_minutes = updates.standardTimeMinutes;

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
                    id: mapping.id, customer_code: mapping.customerCode, description: mapping.description, mapped_area: mapping.mappedArea
                });
                if (error) {
                    console.error("Error adding CC mapping:", error);
                    toast.error("Erro ao salvar Centro de Custo: " + error.message);
                }
            },

            updateCostCenterMapping: async (id, updates) => {
                set(s => ({
                    costCenterMappings: s.costCenterMappings.map(m => m.id === id ? { ...m, ...updates } : m)
                }));
                const toUpdate: any = {};
                if (updates.description) toUpdate.description = updates.description;
                if (updates.mappedArea !== undefined) {
                    toUpdate.mapped_area = updates.mappedArea === "" ? null : updates.mappedArea;
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
                if (error) {
                    console.error("Error importing consumables:", error);
                    toast.error("Erro ao importar Lote: " + error.message);
                } else {
                    toast.success("Importação concluída com sucesso!");
                }
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
                    id: qCase.id,
                    order_id: qCase.orderId,
                    asset_id: qCase.assetId,
                    description: qCase.description,
                    type: qCase.type,
                    severity: qCase.severity,
                    status: qCase.status,
                    methodology: qCase.methodology,
                    methodology_data: qCase.methodologyData,
                    images: qCase.images,
                    due_date: qCase.dueDate,
                    created_by: qCase.createdBy
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
                if (updates.images) toUpdate.images = updates.images;
                if (updates.dueDate) toUpdate.due_date = updates.dueDate;

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

            // --- Shopfloor V6 Actions ---
            addProductionLine: async (line) => {
                set(s => ({ productionLines: [...s.productionLines, line] }));
                const { error } = await supabase.from('production_lines').insert({
                    id: line.id, description: line.description,
                    daily_capacity: line.dailyCapacity, allowed_models: line.allowedModels,
                    active: line.active
                });
                if (error) console.error("Error adding production line:", error);
            },

            updateProductionLine: async (id, updates) => {
                set(s => ({ productionLines: s.productionLines.map(l => l.id === id ? { ...l, ...updates } : l) }));
                const toUpdate: any = {};
                if (updates.description) toUpdate.description = updates.description;
                if (updates.dailyCapacity) toUpdate.daily_capacity = updates.dailyCapacity;
                if (updates.allowedModels) toUpdate.allowed_models = updates.allowedModels;
                if (updates.active !== undefined) toUpdate.active = updates.active;

                await supabase.from('production_lines').update(toUpdate).eq('id', id);
            },

            addSequencingRule: async (rule) => {
                set(s => ({ sequencingRules: [...s.sequencingRules, rule] }));
                const { error } = await supabase.from('sequencing_rules').insert({
                    id: rule.id, product_model_id: rule.productModelId, area_id: rule.areaId,
                    offset_days: rule.offsetDays, duration_days: rule.durationDays,
                    dependency_area_id: rule.dependencyAreaId
                });
                if (error) console.error("Error adding sequencing rule:", error);
            },

            updateSequencingRule: async (id, updates) => {
                set(s => ({ sequencingRules: s.sequencingRules.map(r => r.id === id ? { ...r, ...updates } : r) }));
                const toUpdate: any = {};
                if (updates.offsetDays !== undefined) toUpdate.offset_days = updates.offsetDays;
                if (updates.durationDays !== undefined) toUpdate.duration_days = updates.durationDays;
                if (updates.dependencyAreaId !== undefined) toUpdate.dependency_area_id = updates.dependencyAreaId;
                await supabase.from('sequencing_rules').update(toUpdate).eq('id', id);
            },

            deleteSequencingRule: async (id) => {
                set(s => ({ sequencingRules: s.sequencingRules.filter(r => r.id !== id) }));
                await supabase.from('sequencing_rules').delete().eq('id', id);
            },


            // --- Shopfloor IoT - Hardware Actions ---
            rfidReaders: [],
            iotEvents: [],

            addRfidReader: (reader) => set(s => ({ rfidReaders: [...s.rfidReaders, reader] })),
            updateRfidReader: (id, updates) => set(s => ({ rfidReaders: s.rfidReaders.map(r => r.id === id ? { ...r, ...updates } : r) })),
            deleteRfidReader: (id) => set(s => ({ rfidReaders: s.rfidReaders.filter(r => r.id !== id) })),

            logIotEvent: (event) => set(s => {
                const newEvents = [event, ...s.iotEvents];
                return { iotEvents: newEvents.slice(0, 50) };
            }),
            clearIotEvents: () => set({ iotEvents: [] }),

            // --- Shopfloor V6 IoT Actions ---
            findAssetByRfid: (tag) => {
                return get().assets.find(a => a.rfidTag?.toUpperCase() === tag.toUpperCase());
            },

            findEmployeeByRfid: (tag) => {
                return get().employees.find(e => e.rfidTag?.toUpperCase() === tag.toUpperCase());
            },

            findStationByFixedId: (fixedId) => {
                // Stations are Assets (Workstations) or defined Stations? 
                // Currently looking at Assets with type='Workstation' or similar, 
                // but checking all assets is safer if we attach fixedId to them.
                return get().assets.find(a => a.locationFixedId?.toUpperCase() === fixedId.toUpperCase());
            },

            // --- Shopfloor V7 Parts Actions ---
            addProductPart: async (part) => {
                set(s => ({ productParts: [...s.productParts, part] }));
                const { error } = await supabase.from('product_parts').insert({
                    id: part.id, product_model_id: part.productModelId, name: part.name, category: part.category, rfid_required: part.rfidRequired
                });
                if (error) console.error("Error adding product part", error);
            },

            addOrderPart: async (part) => {
                set(s => ({ orderParts: [...s.orderParts, part] }));
                const { error } = await supabase.from('order_parts').insert({
                    id: part.id, order_id: part.orderId, part_definition_id: part.partDefinitionId,
                    rfid_tag: part.rfidTag, status: part.status
                });
                if (error) console.error("Error adding order part", error);
            },

            updateOrderPart: async (id, updates) => {
                set(s => ({ orderParts: s.orderParts.map(p => p.id === id ? { ...p, ...updates } : p) }));
                const toUpdate: any = {};
                if (updates.rfidTag) toUpdate.rfid_tag = updates.rfidTag;
                if (updates.status) toUpdate.status = updates.status;
                if (updates.producedAt) toUpdate.produced_at = updates.producedAt;

                await supabase.from('order_parts').update(toUpdate).eq('id', id);
            },

            // --- Mold Management Actions ---
            addMoldCompatibility: async (pair) => {
                set(s => ({ moldCompatibility: [...s.moldCompatibility, pair] }));
                const { error } = await supabase.from('mold_compatibility').insert({
                    id: pair.id, hull_mold_id: pair.hullMoldId, deck_mold_id: pair.deckMoldId,
                    compatibility_score: pair.compatibilityScore, notes: pair.notes
                });
                if (error) console.error("Error adding mold compatibility:", error);
            },

            removeMoldCompatibility: async (id) => {
                set(s => ({ moldCompatibility: s.moldCompatibility.filter(c => c.id !== id) }));
                await supabase.from('mold_compatibility').delete().eq('id', id);
            },

            // --- Andon Actions ---
            triggerAndon: async (alert) => {
                set(s => ({ alerts: [...s.alerts, alert] }));
                const { error } = await supabase.from('alerts').insert({
                    id: alert.id, station_id: alert.stationId, type: alert.type,
                    status: alert.status, description: alert.description,
                    created_at: alert.createdAt
                });
                if (error) console.error("Error triggering andon:", error);
            },

            resolveAndon: async (id, resolvedBy) => {
                const now = new Date().toISOString();
                set(s => ({
                    alerts: s.alerts.map(a => a.id === id ? { ...a, status: 'resolved', resolvedAt: now, resolvedBy } : a)
                }));
                await supabase.from('alerts').update({
                    status: 'resolved', resolved_at: now, resolved_by: resolvedBy
                }).eq('id', id);
            },

            addMoldMaintenanceLog: async (log) => {
                set(s => ({ moldMaintenanceLogs: [...s.moldMaintenanceLogs, log] }));
                const { error } = await supabase.from('mold_maintenance_logs').insert({
                    id: log.id, mold_id: log.moldId, description: log.description,
                    severity: log.severity, status: log.status, images: log.images,
                    technician_id: log.technicianId
                });
                if (error) console.error("Error adding mold log:", error);
            },

            updateMoldMaintenanceLog: async (id, updates) => {
                set(s => ({
                    moldMaintenanceLogs: s.moldMaintenanceLogs.map(l => l.id === id ? { ...l, ...updates } : l)
                }));
                const toUpdate: any = {};
                if (updates.status) {
                    toUpdate.status = updates.status;
                    if (updates.status === 'Resolved') toUpdate.resolved_at = new Date().toISOString();
                }
                if (updates.description) toUpdate.description = updates.description;
                if (updates.images) toUpdate.images = updates.images;

                if (Object.keys(toUpdate).length > 0) {
                    await supabase.from('mold_maintenance_logs').update(toUpdate).eq('id', id);
                }
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

            addMaterialRequest: async (req) => {
                set(state => {
                    return { materialRequests: [req, ...state.materialRequests] };
                });

                // Persist
                const { error } = await supabase.from('material_requests').insert({
                    id: req.id,
                    area: req.area,
                    status: req.status,
                    request_date: req.requestDate,
                    items: req.items,
                    total_cost: req.totalCost
                });

                if (error) {
                    console.error("Error adding material request:", error);
                    toast.error("Erro ao salvar Pedido: " + error.message);
                } else {
                    toast.success("Pedido salvo com sucesso!");
                }

                get().logAudit('CREATE_REQUEST', 'consumables', `Created Material Request for ${req.area}`);
            },

            updateMaterialRequest: async (id, updates) => {
                set(state => ({
                    materialRequests: state.materialRequests.map(r => r.id === id ? { ...r, ...updates } : r)
                }));
                // Mock persist via update if needed or just sync
            },

            // --- Shopfloor V13: HR & HST Actions ---
            addEvaluation: async (evaluation) => {
                set(s => ({ dailyEvaluations: [...s.dailyEvaluations, evaluation] }));
                const { error } = await supabase.from('daily_evaluations').insert({
                    id: evaluation.id,
                    employee_id: evaluation.employeeId,
                    supervisor_id: evaluation.supervisorId,
                    date: evaluation.date,
                    hst_score: evaluation.hstScore,
                    epi_score: evaluation.epiScore,
                    post_cleaning_score: evaluation.postCleaningScore,
                    quality_score: evaluation.qualityScore,
                    efficiency_score: evaluation.efficiencyScore,
                    objectives_score: evaluation.objectivesScore,
                    attitude_score: evaluation.attitudeScore,
                    notes: evaluation.notes
                });
                if (error) console.error("Error adding evaluation:", error);
            },

            addCertification: async (cert) => {
                set(s => ({ certifications: [...s.certifications, cert] }));
                const { error } = await supabase.from('certifications').insert({
                    id: cert.id,
                    name: cert.name,
                    description: cert.description,
                    validity_months: cert.validityMonths,
                    risk_level: cert.riskLevel,
                    required_for_stations: cert.requiredForStations
                });
                if (error) console.error("Error adding certification:", error);
            },

            assignCertification: async (empCert) => {
                set(s => ({ employeeCertifications: [...s.employeeCertifications, empCert] }));
                const { error } = await supabase.from('employee_certifications').insert({
                    id: empCert.id,
                    employee_id: empCert.employeeId,
                    certification_id: empCert.certificationId,
                    issue_date: empCert.issueDate,
                    expiry_date: empCert.expiryDate,
                    status: empCert.status,
                    pdf_url: empCert.pdfUrl
                });
                if (error) console.error("Error assigning certification:", error);
            },

            reportIncident: async (incident) => {
                set(s => ({ safetyIncidents: [...s.safetyIncidents, incident] }));
                const { error } = await supabase.from('safety_incidents').insert({
                    id: incident.id,
                    description: incident.description,
                    type: incident.type,
                    severity: incident.severity,
                    area: incident.area,
                    images: incident.images,
                    root_cause: incident.rootCauses?.[0] || null, // Legacy support
                    root_causes: incident.rootCauses, // New array column
                    actions_taken: incident.correctiveActions, // Legacy support
                    corrective_actions: incident.correctiveActions, // New column
                    status: incident.status,
                    reported_by: incident.reportedBy,
                    containment_actions: incident.containmentActions,
                    verification: incident.verification
                });
                if (error) console.error("Error reporting incident:", error);
            },

            updateIncident: async (id, updates) => {
                set(s => ({
                    safetyIncidents: s.safetyIncidents.map(i => i.id === id ? { ...i, ...updates } : i)
                }));

                const dbUpdates: any = {};
                if (updates.status) dbUpdates.status = updates.status;
                if (updates.rootCauses) {
                    dbUpdates.root_causes = updates.rootCauses;
                    dbUpdates.root_cause = updates.rootCauses[0] || null;
                }
                if (updates.correctiveActions) {
                    dbUpdates.corrective_actions = updates.correctiveActions;
                    dbUpdates.actions_taken = updates.correctiveActions;
                }
                if (updates.containmentActions) dbUpdates.containment_actions = updates.containmentActions;
                if (updates.verification) dbUpdates.verification = updates.verification;
                if (updates.resolvedAt) dbUpdates.resolved_at = updates.resolvedAt;
                if (updates.closedAt) dbUpdates.closed_at = updates.closedAt;

                if (Object.keys(dbUpdates).length > 0) {
                    const { error } = await supabase.from('safety_incidents').update(dbUpdates).eq('id', id);
                    if (error) {
                        console.error("Failed to update incident:", error);
                        toast.error("Erro ao atualizar incidente: " + error.message);
                    }
                }
            },

            addInspection: async (inspection) => {
                set(s => ({ safetyInspections: [...s.safetyInspections, inspection] }));
                const { error } = await supabase.from('safety_inspections').insert({
                    id: inspection.id,
                    date: inspection.date,
                    area: inspection.area,
                    inspector_id: inspection.inspectorId,
                    overall_score: inspection.overallScore,
                    checklist_data: inspection.checklistData
                });
                if (error) console.error("Error adding inspection:", error);
            },

            syncData: async () => {
                const start = performance.now();
                console.log("[ShopfloorStore] Syncing data from DB (Parallelized)...");

                // Helper for safe fetching (prevents one failure from blocking all)
                const fetchSafe = async (table: string, query = '*') => {
                    const { data, error } = await supabase.from(table).select(query);
                    if (error) {
                        console.warn(`[Sync] Error fetching ${table}:`, error.message);
                        return null;
                    }
                    return data;
                };

                // Helper for ordering/limiting
                const fetchOrdered = async (table: string, orderCol: string, limit: number) => {
                    const { data, error } = await supabase.from(table).select('*').order(orderCol, { ascending: false }).limit(limit);
                    if (error) return null;
                    return data;
                };

                // Parallel Execution
                const [
                    employees, absenteeism, assets, products, orders, events,
                    productOptions, optionTasks, taskExecutions, orderIssues,
                    qualityCases, qualityActions, scrapReports, scrapTransactions,
                    moldCompatibility, moldLogs,
                    dailyEvaluations, certifications, employeeCertifications, safetyIncidents, safetyInspections,
                    alerts,
                    tools, toolTxs, toolMaint,
                    costCenterMappings, ppeRequests, consumableTransactions, materialRequests,
                    productParts, orderParts,
                    lines, rules,
                    optPivot, assetPivot
                ] = await Promise.all([
                    fetchSafe('employees'), // 0
                    fetchSafe('absenteeism_records'), // 1
                    fetchSafe('assets'), // 2
                    fetchSafe('products'), // 3
                    fetchSafe('orders'), // 4
                    fetchSafe('events'), // 5
                    fetchSafe('product_options'), // 6
                    fetchSafe('option_tasks'), // 7
                    fetchSafe('task_executions'), // 8
                    fetchSafe('order_issues'), // 9
                    fetchSafe('quality_cases'), // 10
                    fetchSafe('quality_actions'), // 11
                    fetchSafe('scrap_reports'), // 12
                    fetchSafe('scrap_transactions'), // 13 (New)
                    fetchSafe('mold_compatibility'), // 13
                    fetchSafe('mold_maintenance_logs'), // 14
                    fetchSafe('daily_evaluations'), // 15
                    fetchSafe('certifications'), // 16
                    fetchSafe('employee_certifications'), // 17
                    fetchSafe('safety_incidents'), // 18
                    fetchSafe('safety_inspections'), // 19
                    // Alerts: active only or recent? Original was 'open', 'acknowledged'.
                    // Use standard select with filter:
                    supabase.from('alerts').select('*').in('status', ['open', 'acknowledged']).then(r => r.data), // 20
                    fetchSafe('tools'), // 21
                    fetchSafe('tool_transactions'), // 22
                    fetchSafe('tool_maintenance'), // 23
                    fetchSafe('cost_center_mappings'), // 24
                    fetchSafe('ppe_requests'), // 25
                    fetchOrdered('consumable_transactions', 'date', 2000), // 26
                    fetchSafe('material_requests'), // 27
                    fetchSafe('product_parts'), // 28
                    fetchSafe('order_parts'), // 29
                    fetchSafe('production_lines'), // 30
                    fetchSafe('sequencing_rules'), // 31
                    fetchSafe('production_order_options'), // 32
                    fetchSafe('production_order_assets'), // 33
                ]);

                // Construct Update Object
                const stateUpdates: Partial<ShopfloorStore> = {};

                // --- Core ---
                if (employees) stateUpdates.employees = employees.map(mapDbToEmployee);
                if (absenteeism) stateUpdates.absenteeismRecords = absenteeism.map(mapDbToAbsenteeism);
                if (assets) stateUpdates.assets = assets.map(mapDbToAsset);

                // --- Products & Routings ---
                if (products) {
                    stateUpdates.products = products.map(mapDbToProduct);
                    stateUpdates.routings = products
                        .filter((p: any) => p.operations && Array.isArray(p.operations))
                        .map((p: any) => ({
                            id: `rt-${p.id}`,
                            productModelId: p.id,
                            operations: p.operations
                        }));
                }

                // --- Orders (Complex Logic) ---
                if (orders) {
                    stateUpdates.orders = orders.map(mapDbToOrder).map(o => {
                        const myOptions = optPivot ? optPivot.filter((p: any) => p.order_id === o.id).map((p: any) => p.option_id) : [];
                        const myAssets = assetPivot
                            ? assetPivot.filter((p: any) => p.order_id === o.id).map((p: any) => p.asset_id)
                            : [];

                        // Fallback logic
                        if (myAssets.length === 0 && o.assetId) myAssets.push(o.assetId);

                        return { ...o, selectedOptions: myOptions, assetIds: myAssets };
                    });
                }

                // --- Events ---
                if (events) stateUpdates.events = events.map(mapDbToEvent);

                // --- Shopfloor 3.0 ---
                if (productOptions) stateUpdates.productOptions = productOptions.map(mapDbToOption);
                if (optionTasks) stateUpdates.optionTasks = optionTasks.map(mapDbToTask);
                if (taskExecutions) stateUpdates.taskExecutions = taskExecutions.map(mapDbToExecution);
                if (orderIssues) stateUpdates.orderIssues = orderIssues.map(mapDbToIssue);

                // --- Quality ---
                if (qualityCases) stateUpdates.qualityCases = qualityCases.map(mapDbToQualityCase);
                if (qualityActions) stateUpdates.qualityActions = qualityActions.map(mapDbToQualityAction);
                if (scrapReports) stateUpdates.scrapReports = scrapReports.map(mapDbToScrapReport);

                // --- Molds ---
                if (moldCompatibility) stateUpdates.moldCompatibility = moldCompatibility.map(mapDbToMoldCompatibility);
                if (moldLogs) stateUpdates.moldMaintenanceLogs = moldLogs.map(mapDbToMoldMaintenanceLog);

                // --- HR / HST ---
                if (dailyEvaluations) {
                    stateUpdates.dailyEvaluations = dailyEvaluations.map((e: any) => ({
                        id: e.id,
                        employeeId: e.employee_id,
                        supervisorId: e.supervisor_id,
                        date: e.date,
                        hstScore: e.hst_score,
                        epiScore: e.epi_score,
                        postCleaningScore: e.post_cleaning_score,
                        qualityScore: e.quality_score,
                        efficiencyScore: e.efficiency_score,
                        objectivesScore: e.objectives_score,
                        attitudeScore: e.attitude_score,
                        notes: e.notes,
                        createdAt: e.created_at
                    }));
                }
                if (certifications) {
                    stateUpdates.certifications = certifications.map((c: any) => ({
                        id: c.id, name: c.name, description: c.description,
                        validityMonths: c.validity_months, riskLevel: c.risk_level, requiredForStations: c.required_for_stations
                    }));
                }
                if (employeeCertifications) {
                    stateUpdates.employeeCertifications = employeeCertifications.map((ec: any) => ({
                        id: ec.id, employeeId: ec.employee_id, certificationId: ec.certification_id,
                        issueDate: ec.issue_date, expiryDate: ec.expiry_date, status: ec.status, pdfUrl: ec.pdf_url
                    }));
                }
                if (safetyIncidents) {
                    stateUpdates.safetyIncidents = safetyIncidents.map((i: any) => ({
                        id: i.id, description: i.description, type: i.type, severity: i.severity,
                        area: i.area, location: i.area || "General", images: i.images,
                        rootCauses: i.root_causes || (i.root_cause ? [i.root_cause] : []),
                        correctiveActions: i.corrective_actions || i.actions_taken,
                        containmentActions: i.containment_actions, verification: i.verification,
                        status: i.status, reportedBy: i.reported_by, date: i.created_at, createdAt: i.created_at,
                        resolvedAt: i.resolved_at, closedAt: i.closed_at
                    }));
                }
                if (safetyInspections) {
                    stateUpdates.safetyInspections = safetyInspections.map((i: any) => ({
                        id: i.id, date: i.date, area: i.area, inspectorId: i.inspector_id,
                        overallScore: i.overall_score, checklistData: i.checklist_data, createdAt: i.created_at
                    }));
                }

                if (alerts) stateUpdates.alerts = alerts.map(mapDbToAlert);
                if (scrapTransactions) stateUpdates.scrapTransactions = scrapTransactions.map(mapDbToScrapTransaction);

                if (tools) {
                    stateUpdates.tools = tools.map((t: any) => ({
                        id: t.id, code: t.code, name: t.name, category: t.category,
                        status: t.status, condition: t.condition, currentHolderId: t.current_holder_id,
                        location: t.location, purchaseDate: t.purchase_date, lastMaintenance: t.last_maintenance
                    }));
                }
                if (toolTxs) {
                    stateUpdates.toolTransactions = toolTxs.map((t: any) => ({
                        id: t.id, toolId: t.tool_id, employeeId: t.employee_id,
                        action: t.action, signature: t.signature, notes: t.notes, createdAt: t.created_at, createdBy: t.created_by
                    }));
                }
                if (toolMaint) stateUpdates.toolMaintenances = toolMaint.map(mapDbToToolMaintenance);

                if (costCenterMappings) stateUpdates.costCenterMappings = costCenterMappings.map(mapDbToCostCenter);
                if (ppeRequests) stateUpdates.ppeRequests = ppeRequests.map(mapDbToPpeRequest);
                if (consumableTransactions) stateUpdates.consumableTransactions = consumableTransactions.map(mapDbToConsumable).reverse();
                if (materialRequests) stateUpdates.materialRequests = materialRequests.map(mapDbToMaterialRequest);

                // --- V7 Parts ---
                if (productParts) {
                    stateUpdates.productParts = productParts.map((p: any) => ({
                        id: p.id, productModelId: p.product_model_id, name: p.name,
                        category: p.category, rfidRequired: p.rfid_required
                    }));
                }
                if (orderParts) {
                    stateUpdates.orderParts = orderParts.map((p: any) => ({
                        id: p.id, orderId: p.order_id, partDefinitionId: p.part_definition_id,
                        rfidTag: p.rfid_tag, status: p.status, producedAt: p.produced_at
                    }));
                }

                // --- Lines ---
                if (lines) stateUpdates.productionLines = lines.map(mapDbToLine);
                if (rules) stateUpdates.sequencingRules = rules.map(mapDbToRule);

                // Apply Updates
                set(stateUpdates);

                const duration = (performance.now() - start).toFixed(2);
                console.log(`[ShopfloorStore] Sync Complete in ${duration}ms (Parallel)`);
            },

            // --- V14: Scrap Actions ---
            addScrapTransaction: async (tx) => {
                set(s => ({ scrapTransactions: [...s.scrapTransactions, tx] }));
                const { error } = await supabase.from('scrap_transactions').insert({
                    id: tx.id, date: tx.date, part_number: tx.partNumber, part_description: tx.partDescription,
                    quantity: tx.quantity, reason_code: tx.reasonCode, cost_center: tx.costCenter,
                    unit_cost: tx.unitCost, total_cost: tx.totalCost, status: tx.status,
                    reported_by: tx.reportedBy, approved_by: tx.approvedBy, notes: tx.notes
                });
                if (error) console.error("Error adding scrap:", error);
            },

            updateScrapTransaction: async (id, updates) => {
                set(s => ({ scrapTransactions: s.scrapTransactions.map(t => t.id === id ? { ...t, ...updates } : t) }));
                const dbUpdates: any = {};
                if (updates.status) dbUpdates.status = updates.status;
                if (updates.approvedBy) dbUpdates.approved_by = updates.approvedBy;
                if (updates.exportedAt) dbUpdates.exported_at = updates.exportedAt;

                const { error } = await supabase.from('scrap_transactions').update(dbUpdates).eq('id', id);
                if (error) console.error("Error updating scrap:", error);
            },

            importAS400Data: async (type, data) => {
                console.log(`Importing ${type}`, data);
                // Placeholder for logic
            },

            // --- V8: Mold Maintenance Actions ---

            addMaintenanceOrder: (order) => set(s => ({ maintenanceOrders: [...s.maintenanceOrders, order] })),

            updateMaintenanceOrder: (id, updates) => set(s => ({
                maintenanceOrders: s.maintenanceOrders.map(o => o.id === id ? { ...o, ...updates } : o)
            })),

            addMaintenancePin: (pin) => set(s => ({
                maintenanceOrders: s.maintenanceOrders.map(o =>
                    o.id === pin.orderId
                        ? { ...o, pins: [...(o.pins || []), pin] }
                        : o
                )
            })),

            updateMaintenancePin: (id, updates) => set(s => ({
                maintenanceOrders: s.maintenanceOrders.map(o => {
                    if (o.id !== (s.maintenanceOrders.find(mo => mo.pins?.some(p => p.id === id))?.id)) return o;

                    return {
                        ...o,
                        pins: o.pins?.map(p => p.id === id ? { ...p, ...updates } : p)
                    };
                })
            })),

            setMoldGeometries: (geometries) => set({ moldGeometries: geometries }),

            // --- V9: IAM Actions ---
            login: (user) => {
                set({ currentUser: user });
                get().logAudit('LOGIN', 'auth', `User ${user.name} logged in`);
            },
            logout: () => {
                const user = get().currentUser;
                set({ currentUser: null });
                if (user) get().logAudit('LOGOUT', 'auth', `User ${user.name} logged out`);
            },
            updateUserPermissions: (userId, permissions) => {
                set(state => {
                    const isCurrentUser = state.currentUser?.id === userId;
                    const updatedEmployees = state.employees.map(e =>
                        e.id === userId ? { ...e, permissions, role: (e as any).role || 'operator' } : e
                    );

                    return {
                        currentUser: isCurrentUser ? { ...state.currentUser!, permissions } : state.currentUser,
                        employees: updatedEmployees
                    };
                });
                // Persist to DB
                supabase.from('employees').update({ permissions }).eq('id', userId).then(({ error }) => {
                    if (error) {
                        console.error("Failed to persist permissions:", error);
                        toast.error("Erro ao salvar Permissões: " + error.message);
                    } else {
                        toast.success("Permissões atualizadas.");
                    }
                });
                get().logAudit('UPDATE_PERMISSIONS', 'admin', `Permissions updated for user ${userId}`);
            },
            updateUserSettings: (settings) => {
                const currentUser = get().currentUser;
                if (!currentUser) return;

                set(state => {
                    if (!state.currentUser) return state;
                    return {
                        currentUser: {
                            ...state.currentUser,
                            settings: { ...state.currentUser.settings, ...settings } as UserSettings
                        }
                    };
                });

                // Persist
                const newSettings = { ...currentUser.settings, ...settings };
                supabase.from('employees').update({ settings: newSettings }).eq('id', currentUser.id).then(({ error }) => {
                    if (error) {
                        console.error("Failed to persist settings:", error);
                        toast.error("Erro ao salvar Configurações: " + error.message);
                    } else {
                        toast.success("Configurações salvas.");
                    }
                });
            },
            logAudit: (action, module, description) => {
                const log: AuditLog = {
                    id: `log-${Date.now()}`,
                    userId: get().currentUser?.id || 'system',
                    userName: get().currentUser?.name || 'System',
                    action,
                    targetModule: module,
                    description,
                    timestamp: new Date().toISOString()
                };
                set(s => ({ auditLogs: [log, ...s.auditLogs].slice(0, 1000) }));
            },
        }),
        {
            name: 'shopfloor-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentUser: state.currentUser, // Critical for session persistence
                employees: state.employees,
                orders: state.orders,
                events: state.events,
                assets: state.assets,
                products: state.products,
                materialRequests: state.materialRequests,
                consumableTransactions: state.consumableTransactions,
                moldMaintenanceLogs: state.moldMaintenanceLogs,
                maintenanceOrders: state.maintenanceOrders
            }),
        }
    ));
