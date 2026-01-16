import * as XLSX from 'xlsx';

export const generateCheckoutTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
        {
            "toolCode": "E.g. FUR-01",
            "employeeId": "E.g. 101 or EMP-001 or Name (Exact Match)",
            "notes": "Optional notes"
        }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CheckoutBatch");
    XLSX.writeFile(wb, "Modelo_Entrega_Lote.xlsx");
};

export const parseCheckoutExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 2 }); // Assuming row 1 is header? No, usually {header: 0} for auto headers using row 1
                // Wait, if I export json_to_sheet with default, row 1 is keys.
                // So sheet_to_json with defaults uses row 1 as keys.

                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsBinaryString(file);
    });
};
