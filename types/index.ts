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
}

// --- Product Engineering (Como fazer) ---
export interface ProductModel {
    id: string;
    name: string; // ex: "Interceptor 40"
    description: string;
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

    // Job & Contract
    contractType: string;
    group: string;
    area: string; // Link to Area name
    workstation: string;
    shift: string; // Turno
    supervisor: string;
    leader: string;

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
    hasFoam?: boolean; // Carpentry Option
    hasTapizados?: boolean; // Upholstery Option 1 (Tapizados)
    hasCanvas?: boolean; // Upholstery Option 2 (Lonas)
    preAssemblySelection?: string[]; // Production Option (Pré-Montagem)
    hasBottomPaint?: boolean; // Production Option (Corte)
    activeOperations?: OperationDefinition[]; // Operations specific to this order instance
}

export interface ProductionEvent {
    id: string;
    orderId: string;
    operationId: string;
    assetId: string;
    timestamp: string; // ISO Date
    type: 'START' | 'STOP' | 'PAUSE' | 'RESUME' | 'COMPLETE';
    reason?: string; // Para paradas (Ex: Falta de material)
}
