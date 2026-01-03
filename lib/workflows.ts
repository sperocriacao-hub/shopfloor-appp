import { OperationDefinition } from "@/types";

export const generateCarpentryOperations = (hasFoam: boolean): OperationDefinition[] => {
    let seq = 10;
    const ops: OperationDefinition[] = [];

    const addOp = (name: string, subarea: string, assetType: string) => {
        ops.push({
            id: `op-${Date.now()}-${seq}`,
            name: `${subarea} - ${name}`,
            sequence: seq,
            standardTimeMinutes: 60,
            requiredAssetType: assetType,
            instructions: `Executar ${name} na subárea ${subarea}`
        });
        seq += 10;
    };

    // 1.1 Laminação – Madeiras
    addOp('CNC – Fanuc', 'Lam. Madeiras', 'Machine');
    addOp('Lixagem', 'Lam. Madeiras', 'Workstation');
    addOp('Resina', 'Lam. Madeiras', 'Workstation');
    addOp('Montagem', 'Lam. Madeiras', 'Workstation');
    addOp('Pick', 'Lam. Madeiras', 'Workstation');

    // 1.2 Laminação – Panos
    addOp('CNC – Lectra', 'Lam. Panos', 'Machine');
    addOp('Lixagem', 'Lam. Panos', 'Workstation');
    addOp('Resina', 'Lam. Panos', 'Workstation');
    addOp('Montagem', 'Lam. Panos', 'Workstation');
    addOp('Pick', 'Lam. Panos', 'Workstation');

    // 1.3 Espumas (Opcional)
    if (hasFoam) {
        addOp('Preparação', 'Espumas', 'Workstation');
        addOp('Injeção', 'Espumas', 'Machine');
        addOp('Pick', 'Espumas', 'Workstation');
    }

    // 1.4 Montagem
    addOp('CNC – Morbidelli', 'Sub. Montagem', 'Machine');
    addOp('Acabamento', 'Sub. Montagem', 'Workstation');
    addOp('Orla', 'Sub. Montagem', 'Machine');
    addOp('Pick', 'Sub. Montagem', 'Workstation');

    return ops;
};

export const generateUpholsteryOperations = (hasTapizados: boolean, hasCanvas: boolean): OperationDefinition[] => {
    let seq = 10;
    const ops: OperationDefinition[] = [];

    const addOp = (name: string, subarea: string, assetType: string) => {
        ops.push({
            id: `op-${Date.now()}-${seq}`,
            name: `${subarea} - ${name}`,
            sequence: seq,
            standardTimeMinutes: 45,
            requiredAssetType: assetType,
            instructions: `Executar ${name} na subárea ${subarea}`
        });
        seq += 10;
    };

    // 2.1 Estofos (Obrigatório)
    addOp('CNC', 'Estofos', 'Machine');
    addOp('Kanban', 'Estofos', 'Workstation');
    addOp('Bordados', 'Estofos', 'Machine');
    addOp('Costura', 'Estofos', 'Workstation');
    addOp('Montagem', 'Estofos', 'Workstation');
    addOp('Pick', 'Estofos', 'Workstation');

    // 2.2 Tapizados (Opcional)
    if (hasTapizados) {
        addOp('CNC', 'Tapizados', 'Machine');
        addOp('Kanban', 'Tapizados', 'Workstation');
        addOp('Montagem', 'Tapizados', 'Workstation');
        addOp('Pick', 'Tapizados', 'Workstation');
    }

    // 2.3 Bancos (Obrigatório)
    addOp('CNC', 'Bancos', 'Machine');
    addOp('Kanban', 'Bancos', 'Workstation');
    addOp('Bordados', 'Bancos', 'Machine');
    addOp('Costura', 'Bancos', 'Workstation');
    addOp('Montagem', 'Bancos', 'Workstation');
    addOp('Pick', 'Bancos', 'Workstation');

    // 2.4 Lonas (Opcional)
    if (hasCanvas) {
        addOp('CNC', 'Lonas', 'Machine');
        addOp('Montagem', 'Lonas', 'Workstation');
        addOp('Pick', 'Lonas', 'Workstation');
    }

    return ops;
};

export const generateProductionOperations = (preAssemblySelection: string[], hasBottomPaint: boolean): OperationDefinition[] => {
    let seq = 3000; // Start higher to distinguish Area 3 (Production)
    const ops: OperationDefinition[] = [];

    const addOp = (name: string, subarea: string, area: string = 'Produção') => {
        ops.push({
            id: `op-${Date.now()}-${seq}`,
            name: `${subarea} - ${name}`,
            sequence: seq,
            standardTimeMinutes: 60, // Default
            requiredAssetType: 'Workstation', // Simplified for mass generation
            instructions: `Área: ${area} | Sub: ${subarea} | Estação: ${name}`
        });
        seq += 10;
    };

    // --- 3. LAMINAÇÃO ---
    // 3.1 Cobertas
    addOp('Preparação', 'Lam. Cobertas', 'Laminação');
    addOp('Cabine de Pintura', 'Lam. Cobertas', 'Laminação');
    addOp('Repassagem', 'Lam. Cobertas', 'Laminação');
    addOp('Skin', 'Lam. Cobertas', 'Laminação');
    addOp('Marcação', 'Lam. Cobertas', 'Laminação');
    addOp('Stiffen', 'Lam. Cobertas', 'Laminação');
    addOp('Estrutura', 'Lam. Cobertas', 'Laminação');
    addOp('União Liner/Banheiras', 'Lam. Cobertas', 'Laminação');
    addOp('Basecoat', 'Lam. Cobertas', 'Laminação');
    addOp('Pop', 'Lam. Cobertas', 'Laminação');

    // 3.2 Cascos
    addOp('Preparação', 'Lam. Cascos', 'Laminação');
    addOp('Cabine de Pintura', 'Lam. Cascos', 'Laminação');
    addOp('Repassagem', 'Lam. Cascos', 'Laminação');
    addOp('skin', 'Lam. Cascos', 'Laminação'); // User type 'kin' or 'skin'? Using skin based on context. User wrote 'kin' in prompt but likely 'Skin'.
    addOp('Lam 1', 'Lam. Cascos', 'Laminação');
    addOp('Lam 2', 'Lam. Cascos', 'Laminação');
    addOp('Trampson/Espumas', 'Lam. Cascos', 'Laminação');
    addOp('Marcação', 'Lam. Cascos', 'Laminação');
    addOp('Stiffen', 'Lam. Cascos', 'Laminação');
    addOp('Estrutura', 'Lam. Cascos', 'Laminação');
    addOp('Topcoat', 'Lam. Cascos', 'Laminação');
    addOp('Pop', 'Lam. Cascos', 'Laminação');

    // 3.3 Liners
    addOp('Preparação', 'Lam. Liners', 'Laminação');
    addOp('Cabine de Pintura', 'Lam. Liners', 'Laminação');
    addOp('Repassagem', 'Lam. Liners', 'Laminação');
    addOp('Skin', 'Lam. Liners', 'Laminação');
    addOp('Marcação', 'Lam. Liners', 'Laminação');
    addOp('Stiffen', 'Lam. Liners', 'Laminação');
    addOp('Estrutura', 'Lam. Liners', 'Laminação');
    addOp('Basecoat', 'Lam. Liners', 'Laminação');
    addOp('Pop', 'Lam. Liners', 'Laminação');

    // 3.4 Small Parts
    addOp('Preparação', 'Lam. Small Parts', 'Laminação');
    addOp('Cabine de Pintura', 'Lam. Small Parts', 'Laminação');
    addOp('Repassagem', 'Lam. Small Parts', 'Laminação');
    addOp('Skin', 'Lam. Small Parts', 'Laminação');
    addOp('Colagem', 'Lam. Small Parts', 'Laminação');
    addOp('Stiffen', 'Lam. Small Parts', 'Laminação');
    addOp('Basecoat', 'Lam. Small Parts', 'Laminação');
    addOp('Pop', 'Lam. Small Parts', 'Laminação');


    // --- 4. CORTE ---
    // 4.1 Casco
    addOp('Marcação', 'Corte Casco', 'Corte');
    addOp('Cabine de Corte', 'Corte Casco', 'Corte');
    addOp('Validação', 'Corte Casco', 'Corte');
    addOp('União Liner', 'Corte Casco', 'Corte');
    if (hasBottomPaint) {
        addOp('Bottom Paint', 'Corte Casco', 'Corte');
    }

    // 4.2 Coberta
    addOp('Marcação', 'Corte Coberta', 'Corte');
    addOp('Cabine de Corte', 'Corte Coberta', 'Corte');
    addOp('Validação', 'Corte Coberta', 'Corte');

    // 4.3 Small Parts
    addOp('Marcação', 'Corte Small Parts', 'Corte');
    addOp('Cabine de Corte', 'Corte Small Parts', 'Corte');
    addOp('Validação', 'Corte Small Parts', 'Corte');


    // --- 5. REPARAÇÃO ---
    // 5.1 Casco
    addOp('Auditoria', 'Rep. Casco', 'Reparação');
    addOp('Empaste', 'Rep. Casco', 'Reparação');
    addOp('Pintura', 'Rep. Casco', 'Reparação');
    addOp('Reparação', 'Rep. Casco', 'Reparação');

    // 5.2 Coberta
    addOp('Auditoria', 'Rep. Coberta', 'Reparação');
    addOp('Empaste', 'Rep. Coberta', 'Reparação');
    addOp('Pintura', 'Rep. Coberta', 'Reparação');
    addOp('Reparação', 'Rep. Coberta', 'Reparação');

    // 5.3 Small Parts
    addOp('Auditoria', 'Rep. Small Parts', 'Reparação');
    addOp('Laminação', 'Rep. Small Parts', 'Reparação');
    addOp('Empaste', 'Rep. Small Parts', 'Reparação');
    addOp('Pintura', 'Rep. Small Parts', 'Reparação');
    addOp('Reparação', 'Rep. Small Parts', 'Reparação');


    // --- 6. PRÉ-MONTAGEM (Opcional/Selecionável) ---
    // "Madeiras", "Tampas / Plásticos", "Módulos / Móveis", "Consolas", "Tanques", "Acrílicos", "Tekas"
    // User passed selected ones in preAssemblySelection array
    if (preAssemblySelection.includes('Madeiras')) addOp('Madeiras', 'Pré-Montagem', 'Pré-Montagem');
    if (preAssemblySelection.includes('Tampas / Plásticos')) addOp('Tampas / Plásticos', 'Pré-Montagem', 'Pré-Montagem');
    if (preAssemblySelection.includes('Módulos / Móveis')) addOp('Módulos / Móveis', 'Pré-Montagem', 'Pré-Montagem');
    if (preAssemblySelection.includes('Consolas')) addOp('Consolas', 'Pré-Montagem', 'Pré-Montagem');
    if (preAssemblySelection.includes('Tanques')) addOp('Tanques', 'Pré-Montagem', 'Pré-Montagem');
    if (preAssemblySelection.includes('Acrílicos')) addOp('Acrílicos', 'Pré-Montagem', 'Pré-Montagem');
    if (preAssemblySelection.includes('Tekas')) addOp('Tekas', 'Pré-Montagem', 'Pré-Montagem');


    // --- 7. MONTAGEM ---
    addOp('Open Hull', 'Montagem', 'Montagem');
    addOp('Open Deck', 'Montagem', 'Montagem');
    addOp('União', 'Montagem', 'Montagem');
    addOp('Final 1', 'Montagem', 'Montagem');
    addOp('Final 2', 'Montagem', 'Montagem');
    addOp('Sika', 'Montagem', 'Montagem');
    addOp('Funcionais', 'Montagem', 'Montagem');
    addOp('Auditoria', 'Montagem', 'Montagem');
    addOp('Reparação 1', 'Montagem', 'Montagem');
    addOp('Reparação 2', 'Montagem', 'Montagem');
    addOp('Teste D’Água', 'Montagem', 'Montagem');
    addOp('Final 3', 'Montagem', 'Montagem');
    addOp('Embalamento', 'Montagem', 'Montagem');

    return ops;
};
