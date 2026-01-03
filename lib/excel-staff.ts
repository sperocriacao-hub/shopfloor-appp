import * as XLSX from 'xlsx';
import { Employee } from '@/types';

export const downloadStaffTemplate = () => {
    const headers = [
        ["Numero Operario", "Nome Completo", "Area", "Posto de Trabalho", "Turno", "Tipo Contrato", "Data Admissao (YYYY-MM-DD)", "Data Nascimento (YYYY-MM-DD)", "Supervisor", "Lider", "Nivel ILUO (I,L,U,O)", "Status RH (Ativo/Ferias/Baixa)"]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, "Template Funcionarios");
    XLSX.writeFile(wb, "Modelo_Importacao_Funcionarios.xlsx");
};

export const parseStaffExcel = async (file: File): Promise<Partial<Employee>[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Skip header row
                const rows = jsonData.slice(1) as any[];

                const employees: Partial<Employee>[] = rows.map((row) => ({
                    workerNumber: row[0]?.toString() || "",
                    name: row[1]?.toString() || "",
                    area: row[2]?.toString() || "Produção",
                    workstation: row[3]?.toString() || "",
                    shift: row[4]?.toString() || "Turno A",
                    contractType: row[5]?.toString() || "Determinado",
                    admissionDate: row[6]?.toString(), // Expecting YYYY-MM-DD or excel date handling might be needed if typed as date
                    birthday: row[7]?.toString(),
                    supervisor: row[8]?.toString() || "",
                    leader: row[9]?.toString() || "",
                    iluo: (row[10]?.toString() as any) || "I",
                    hrStatus: (row[11]?.toString().toLowerCase() === 'ativo' ? 'active' : 'active') as any, // Simplified validation
                    group: "Operações" // Default
                })).filter(e => e.workerNumber && e.name); // Basic validation

                resolve(employees);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
