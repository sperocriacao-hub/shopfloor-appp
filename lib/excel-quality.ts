import * as XLSX from 'xlsx';

export const exportQualityReport = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Qualidade");
    XLSX.writeFile(wb, `Relatorio_Qualidade_${new Date().toISOString().split('T')[0]}.xlsx`);
};
