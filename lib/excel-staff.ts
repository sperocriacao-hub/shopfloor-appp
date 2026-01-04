import * as XLSX from 'xlsx';
import { Employee } from '@/types';

export const downloadStaffTemplate = () => {
    const headers = [
        ["Numero Operario", "Nome Completo", "Area", "Posto de Trabalho", "Turno", "Tipo Contrato", "Data Admissao", "Data Nascimento", "Supervisor", "Lider", "Gestor", "Nivel ILUO", "Status RH"]
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

                const employees: Partial<Employee>[] = rows.map((row) => {
                    const admissionRaw = row[6];
                    const birthdayRaw = row[7];

                    // Simple Excel date converter (if number)
                    const parseDate = (val: any) => {
                        if (!val) return "";
                        if (typeof val === 'number') {
                            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                            return date.toISOString().split('T')[0];
                        }
                        return val.toString();
                    };

                    return {
                        workerNumber: row[0]?.toString() || "",
                        name: row[1]?.toString() || "",
                        area: row[2]?.toString() || "Produção",
                        workstation: row[3]?.toString() || "",
                        shift: row[4]?.toString() || "Turno A",
                        contractType: row[5]?.toString() || "Determinado",
                        admissionDate: parseDate(admissionRaw),
                        birthday: parseDate(birthdayRaw),
                        supervisor: row[8]?.toString() || "",
                        leader: row[9]?.toString() || "",
                        manager: row[10]?.toString() || "", // NEW FIELD
                        iluo: (row[11]?.toString() as any) || "I",
                        hrStatus: (row[12]?.toString().toLowerCase() === 'ativo' ? 'active' : 'active') as any, // Shifted columns
                        group: "Operações"
                    };
                }).filter(e => e.workerNumber && e.name);

                resolve(employees);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
