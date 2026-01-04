import { ProductModel } from "@/types";
import * as XLSX from 'xlsx';

export const downloadProductsTemplate = () => {
    const templateData = [
        {
            id: "MODEL-001",
            name: "Novo Modelo Exemplo",
            description: "Descrição do modelo"
        },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
    XLSX.writeFile(workbook, "modelo_importacao_produtos.xlsx");
};

export const parseProductsExcel = (file: File): Promise<ProductModel[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const products: ProductModel[] = jsonData.map((row: any) => ({
                    id: row.id || `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: row.name,
                    description: row.description || '',
                }));

                resolve(products);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
