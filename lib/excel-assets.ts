import { Asset } from "@/types";
import * as XLSX from "xlsx";

export const downloadAssetsTemplate = () => {
    // 1. Define Headers
    const headers = [
        "Nome (Ex: CNC Fanuc 01)",
        "Tipo (Machine/Workstation/Mold)",
        "Área (Ex: Carpintaria)",
        "Subárea (Opcional)",
        "Status (available/in_use/maintenance)",
        "Capacidades (Separar por vírgula)"
    ];

    // 2. Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);

    // 3. Add Example Row
    XLSX.utils.sheet_add_aoa(ws, [[
        "Serra Fita 01",
        "Machine",
        "Carpintaria",
        "Corte",
        "available",
        "Corte Reto, Corte Curvo"
    ]], { origin: -1 });

    // 4. Append Sheet & Save
    XLSX.utils.book_append_sheet(wb, ws, "Ativos");
    XLSX.writeFile(wb, "Modelo_Importacao_Ativos.xlsx");
};

export const parseAssetsExcel = async (file: File): Promise<Partial<Asset>[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const wb = XLSX.read(data, { type: 'binary' });
                const wsName = wb.SheetNames[0];
                const ws = wb.Sheets[wsName];
                const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Skip header row
                const rows = jsonData.slice(1) as any[];

                const assets: Partial<Asset>[] = rows.map((row) => ({
                    name: row[0]?.toString() || "Sem Nome",
                    type: row[1]?.toString() || "Workstation",
                    area: row[2]?.toString() || "Geral",
                    subarea: row[3]?.toString() || "",
                    status: (['available', 'in_use', 'maintenance', 'breakdown'].includes(row[4]) ? row[4] : 'available') as any,
                    capabilities: row[5] ? row[5].toString().split(',').map((s: string) => s.trim()) : []
                })).filter(a => a.name !== "Sem Nome"); // Basic validation

                resolve(assets);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};
