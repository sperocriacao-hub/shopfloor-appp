// --- Master Data (Recursos Físicos) ---
export type AssetStatus = 'available' | 'in_use' | 'maintenance' | 'breakdown';

export interface Asset {
    id: string;
    name: string; // ex: "CNC Fanuc 01"
    type: string; // ex: "Machine", "Workstation", "Mold"
    area: string; // ex: "Carpintaria"
    subarea?: string; // ex: "Laminação - Madeiras"
    status: AssetStatus;
    capabilities: string[]; // ex: ["Cutting", "Drilling"]
    defaultCycleTime?: number; // Minutes
    sequence?: number; // Custom sorting order
    enableQualityModule?: boolean; // V5: Feature Switch
    rfidTag?: string; // V6: Hardware ID
    locationFixedId?: string; // V6: Fixed Reader ID
}

// --- Product Engineering (Como fazer) ---
export interface ProductModel {
    id: string;
    name: string; // ex: "Interceptor 40"
    description: string;
    operations?: OperationDefinition[];
}

export interface OperationDefinition {
    id: string;
    name: string; // ex: "Laminar Casco"
    sequence: number; // 10, 20, 30...
    standardTimeMinutes: number; // Meta para OEE -> Performance
    requiredAssetType: string; // ex: "Mold"
    instructions?: string;
}


export interface ProductionLine {
    id: string; // 'A', 'B', 'C', 'D'
    description: string;
    dailyCapacity: number;
    allowedModels: string[];
    active: boolean;
}

export interface SequencingRule {
    id: string;
    productModelId: string;
    areaId: string;
    offsetDays: number; // Days before delivery (T-X)
    durationDays: number;
    dependencyAreaId?: string;
}

export interface Station {
    id: string;
    name: string;
    subareaId: string;
    areaId: string;
    status: 'active' | 'inactive' | 'maintenance';
}

export interface Alert {
    id: string;
    stationId: string;
    type: 'material' | 'maintenance' | 'quality' | 'help';
    status: 'open' | 'acknowledged' | 'resolved';
    description?: string;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
}

// --- HR / Staff ---
export type ILUOLevel = 'I' | 'L' | 'U' | 'O';
export type HRStatus = 'active' | 'vacation' | 'sick_leave' | 'terminated';
export type UserRole = 'operator' | 'leader' | 'planner' | 'admin';

export interface SystemAccess {
    username: string;
    password?: string; // Optional for list view security, required for creation
    role: UserRole;
    lastLogin?: string;
}

export type AbsenteeismType = 'Full Day' | 'Late' | 'Early Departure' | 'Sick Leave' | 'Vacation';

export interface AbsenteeismRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    type: AbsenteeismType;
    durationMinutes?: number; // Only for Late/Early
    reason?: string;
    approvedBy?: string; // Leader name/id
    timestamp: string; // ISO
}

export interface Employee {
    id: string;
    workerNumber: string;
    name: string;
    rfidTag?: string; // V6: Hardware Badge ID

    // Job & Contract
    contractType: string;
    jobTitle: string; // Função
    group: string;
    area: string; // Link to Area name
    workstation: string;
    shift: string; // Turno
    supervisor: string;
    leader: string;
    manager: string;

    // Dates
    admissionDate: string; // ISO Date
    contractStartDate: string; // ISO Date
    terminationDate?: string; // ISO Date
    birthday: string; // ISO Date

    // Development
    talentMatrix: string; // Descriptive or Category
    iluo: ILUOLevel;

    // Status
    hrStatus: HRStatus;
    hrNotes?: string;

    // System Access
    hasSystemAccess: boolean;
    systemAccess?: SystemAccess;

    // IAM / V9
    permissions?: UserPermissions;
    settings?: UserSettings;
    role?: UserRole;
}

export interface Routing {
    id: string;
    productModelId: string;
    operations: OperationDefinition[];
}

// --- Execution (O que está acontecendo) ---
export type OrderStatus = 'planned' | 'in_progress' | 'completed' | 'hold';

// --- Shopfloor V7: Parts Tracking ---
export interface ProductPart {
    id: string;
    productModelId: string;
    name: string;
    category: 'Big' | 'Medium' | 'Small';
    rfidRequired: boolean;
}

export interface OrderPart {
    id: string;
    orderId: string;
    partDefinitionId: string;
    rfidTag?: string;
    status: 'pending' | 'produced' | 'assembled';
    producedAt?: string;
}

export interface ProductionOrder {
    id: string; // ex: "PO-2024-001"
    productModelId: string;
    quantity: number;
    status: OrderStatus;
    currentOperationId?: string; // Onde está agora

    // Registration Info
    po?: string;        // Purchase Order
    pp?: string;        // Production Plan
    hin?: string;       // Hull Identification Number
    partn?: string;     // Part Number
    startDate?: Date;
    finishDate?: Date; // or dueDate
    br?: string;
    country?: string;
    customer?: string;
    area?: string;
    productionLineId?: string; // Shopfloor V6

    // Instance Workflow
    assetId?: string; // Target Station (Shopfloor 3.0)
    assetIds?: string[]; // Multiple Stations (Shopfloor 4.0)
    selectedOptions?: string[]; // Array of ProductOption IDs (Shopfloor 3.0)

    // Legacy Fields (Deprecated)
    hasFoam?: boolean;
    hasTapizados?: boolean;
    hasCanvas?: boolean;
    preAssemblySelection?: string[];
    hasBottomPaint?: boolean;
    activeOperations?: OperationDefinition[];
}

// --- Shopfloor 3.0: Options & Checklists ---

export interface ProductOption {
    id: string;
    productModelId?: string;
    name: string;
    description?: string;
}

export interface OptionTask {
    id: string;
    optionId: string;
    description: string;
    sequence: number;
    pdfUrl?: string;
    stationId?: string; // New: Target Station for this task
    standardTimeMinutes?: number; // Shopfloor V6: Cost/Time
}

export interface TaskExecution {
    orderId: string;
    taskId: string;
    completedAt?: string; // ISO Date
    completedBy?: string;
}

export interface OrderIssue {
    id: string;
    orderId: string;
    stationId: string; // Who reported
    relatedStationId?: string; // New: Responsible/Causing Station
    type: 'material' | 'adjust' | 'blockage' | 'other';
    description: string;
    status: 'open' | 'resolved';
    createdAt: string; // ISO Date
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface ProductionEvent {
    id: string;
    orderId: string;
    operationId?: string;
    assetId: string;
    timestamp: string; // ISO Date
    type: 'START' | 'STOP' | 'PAUSE' | 'RESUME' | 'COMPLETE';
    reason?: string; // Para paradas (Ex: Falta de material)
}
// --- Quality Module (Shopfloor V5) ---
export type QualityCaseType = 'internal' | 'supplier' | 'warranty' | 'audit';
export type QualitySeverity = 'low' | 'medium' | 'high' | 'critical';
export type QualityStatus = 'open' | 'investigating' | 'action_plan' | 'monitoring' | 'resolved';
export type QualityMethodology = 'ishikawa' | '5whys' | 'a3' | '8d' | 'none';

export interface EightDData {
    team: string; // Comma separated names or formatted text
    problemDetails: {
        what: string;
        where: string;
        when: string;
        who: string;
        how: string;
        metrics: string;
    };
    containmentActions: string;
    ishikawa: {
        machine: string;
        method: string;
        material: string;
        manpower: string;
        measurement: string;
        environment: string;
    };
    fiveWhys: string[]; // Array of 5 strings
    rootCause: string;
}

export interface QualityCase {
    id: string;
    orderId?: string;
    assetId: string;
    description: string;
    type: QualityCaseType;
    severity: QualitySeverity;
    status: QualityStatus;
    methodology: QualityMethodology;
    methodologyData?: EightDData | any; // JSONB
    images?: string[]; // Array of base64/url
    dueDate?: string; // ISO Date for deadline
    notes?: string;
    createdAt: string; // ISO
    createdBy?: string;
}

export interface QualityAction {
    id: string;
    caseId: string;
    description: string;
    responsible?: string;
    deadline?: string; // ISO Date (YYYY-MM-DD or full)
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: string;
}

// --- Scrap Management (Shopfloor V5) ---
export type ScrapType = 'total' | 'partial';
export type ScrapAction = 'recycle' | 'trash' | 'rework' | 'replacement';

export interface ScrapReport {
    id: string;
    orderId: string;
    assetId: string;
    reportedBy?: string;
    type: ScrapType;
    itemDescription?: string; // If partial
    quantity: number;
    reason?: string;
    actionTaken: ScrapAction;
    replacementOrderId?: string;
    createdAt: string;
}

// --- Tool Management (Ferramentaria) ---
export type ToolStatus = 'available' | 'in_use' | 'maintenance' | 'scrapped' | 'lost';
export type ToolCondition = 'new' | 'good' | 'fair' | 'poor';
export type ToolAction = 'checkout' | 'checkin' | 'maintenance_out' | 'maintenance_return';
// --- Shopfloor 3.0: Molds (Assets) ---
export interface MoldCompatibility {
    id: string;
    hullMoldId: string;
    deckMoldId: string;
    compatibilityScore?: number;
    notes?: string;
}

export interface MoldMaintenanceLog {
    id: string;
    moldId: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved';
    images: string[]; // URLs
    technicianId?: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface Tool {
    id: string;
    code: string;
    name: string;
    category: string;
    status: ToolStatus;
    condition: ToolCondition;
    currentHolderId?: string; // Employee ID
    location: string; // 'ferramentaria', 'maintenance', 'employee', or specific shelf like 'A-01'
    purchaseDate?: string;
    lastMaintenance?: string;
}

export interface ToolTransaction {
    id: string;
    toolId: string;
    employeeId?: string;
    action: ToolAction;
    signature?: string; // Base64
    notes?: string;
    createdAt: string;
    createdBy?: string;
}

export interface ToolMaintenance {
    id: string;
    toolId: string;
    description: string;
    status: 'pending' | 'in_progress' | 'waiting_parts' | 'completed' | 'condemned';
    cost?: number;
    replacementRequested?: boolean;
    technicianNotes?: string;
    createdAt: string;
    completedAt?: string;
}

// --- Consumables Management (AS400 Integration) ---
export interface CostCenterMapping {
    id: string;
    customerCode: string;
    description: string;
    mappedArea?: string; // String Area Name
}

export interface PpeRequest {
    id: string;
    employeeId?: string;
    assetId?: string; // Area needing the item
    itemName: string;
    partNumber?: string;
    quantity: number;
    unitCost?: number;
    status: 'pending' | 'processed' | 'delivered' | 'rejected';
    requestDate: string; // ISO Date
    processedAt?: string;
    processedBy?: string;
    notes?: string;
    // V2: Multi-item support
    items?: PpeRequestItem[];
}

export interface PpeRequestItem {
    id: string;
    itemName: string;
    partNumber?: string;
    quantity: number;
    unitCost?: number;
}

export interface MaterialRequest {
    id: string;
    area: string; // Cost Center
    status: 'pending' | 'approved' | 'rejected' | 'delivered';
    requestDate: string;
    requestedBy?: string;
    items: MaterialRequestItem[];
    totalCost: number;
    notes?: string;
    // Warehouse Action
    processedAt?: string;
    processedBy?: string;
}

export interface MaterialRequestItem {
    id: string; // generated
    partNumber: string;
    description: string;
    quantity: number;
    unitCost: number;
    total: number;
}

export interface ConsumableTransaction {
    id: string;
    importId: string;
    date: string; // YYYY-MM-DD
    week?: number;
    orderNumber?: string;
    imsNumber?: string;
    customerCode: string; // From AS400 "Customer"
    areaSource: string;   // From AS400 "Area"
    prodLine: 'INT' | 'PCS' | 'PPI' | 'PST' | string;
    partNumber?: string;
    partDescription?: string;
    quantity: number;
    unitCost: number;
    extensionCost: number;
    userAs400?: string;

    // Computed / Mapped
    mappedAssetId?: string;
    mappedEmployeeId?: string;
}

// --- IoT & Hardware ---
export interface RfidReader {
    id: string;
    name: string;
    ipAddress: string;
    stationId?: string; // Linked Station (Fixed Reader)
    status: 'online' | 'offline' | 'error';
    lastHeartbeat?: string;
}

export interface IotEvent {
    id: string;
    readerId: string;
    tagId: string;
    timestamp: string;
    type: 'READ' | 'HEARTBEAT' | 'ERROR';
    metadata?: any;
}

// --- Shopfloor V8: Mold Maintenance (Spatial) ---
export interface MoldGeometry {
    id: string;
    productModelId: string;
    partType: string;
    svgContent: string;
    width: number;
    height: number;
}

export interface MaintenanceOrder {
    id: string;
    assetId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'verified';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    reportedBy?: string;
    technicianId?: string;
    description: string;
    totalTimeMinutes: number;
    pins?: MaintenancePin[];
}

export interface MaintenancePin {
    id: string;
    orderId: string;
    posX: number;
    posY: number;
    type: 'crack' | 'scratch' | 'polish' | 'wax' | 'gelcoat' | 'structural';
    severity: 'monitoring' | 'repair_needed';
    status: 'open' | 'fixed';
    photoBeforeUrl?: string;
    photoAfterUrl?: string;
}

// --- Shopfloor V9: IAM & Settings ---
export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    units: 'metric' | 'imperial';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
    soundEnabled: boolean;
    soundVolume: number; // 0-100
}

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export type AppModule =
    | 'dashboard'
    | 'orders'
    | 'assets'
    | 'products'
    | 'engineering'
    | 'consumables'
    | 'staff'
    | 'quality'
    | 'tools'
    | 'molds'
    | 'supervisor'
    | 'mobile'
    | 'admin'
    | 'legacy';

export interface UserPermissions {
    [key: string]: PermissionLevel; // key is AppModule
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    targetModule: string;
    description: string;
    timestamp: string;
}

// Extend Employee to include permissions
export interface EmployeeWithPermissions extends Employee {
    role: UserRole;
    permissions?: UserPermissions;
    settings?: UserSettings;
    pinHash?: string; // For PIN login
}
