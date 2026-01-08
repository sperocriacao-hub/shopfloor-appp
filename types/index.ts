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

export interface Station {
    id: string;
    name: string;
    subareaId: string;
    areaId: string;
    status: 'active' | 'inactive' | 'maintenance';
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

export type AbsenteeismType = 'Full Day' | 'Late' | 'Early Departure' | 'Sick Leave' | 'Vacation' | 'Warning';

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
}

export interface Routing {
    id: string;
    productModelId: string;
    operations: OperationDefinition[];
}

// --- Execution (O que está acontecendo) ---
export type OrderStatus = 'planned' | 'in_progress' | 'completed' | 'hold';

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
