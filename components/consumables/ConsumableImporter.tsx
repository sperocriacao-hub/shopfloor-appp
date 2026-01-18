"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { ConsumableTransaction } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function ConsumableImporter() {
    const { importConsumablesBatch, costCenterMappings, employees } = useShopfloorStore();
    const [previewData, setPreviewData] = useState<ConsumableTransaction[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Read as array of arrays first to check headers if needed, or just json
                const data: any[] = XLSX.utils.sheet_to_json(ws);

                // Map to ConsumableTransaction
                const batchId = crypto.randomUUID();
                const mappedData: ConsumableTransaction[] = data.map((row: any) => {
                    const customerCode = String(row['Customer'] || row['customer'] || '');
                    const prodLine = String(row['Prod. Line'] || row['Prod Line'] || '');
                    const rawArea = String(row['Area'] || '');

                    // Auto-Mapping Logic
                    // 1. Customer Code -> Asset (Cost Center)
                    const mapping = costCenterMappings.find(m => m.customerCode === customerCode);
                    const mappedAssetId = mapping?.assetId;

                    // 2. Area -> Employee (for PPI)
                    // Assuming 'Area' column contains Worker Number for PPI items
                    let mappedEmployeeId = undefined;
                    if (prodLine === 'PPI') {
                        // Try to find employee by worker number (Area column)
                        // Sanitize area code (remove leading zeros if needed, or match exact)
                        const workerNum = rawArea.trim();
                        const emp = employees.find(e => e.workerNumber === workerNum);
                        if (emp) mappedEmployeeId = emp.id;
                    }

                    return {
                        id: crypto.randomUUID(),
                        importId: batchId,
                        date: parseExcelDate(row['Date']),
                        week: Number(row['Week']),
                        orderNumber: String(row['Order Number'] || ''),
                        imsNumber: String(row['IMS Number'] || ''),
                        customerCode: customerCode,
                        areaSource: rawArea,
                        prodLine: prodLine,
                        partNumber: String(row['Part Number'] || ''),
                        partDescription: String(row['Part Description'] || ''),
                        quantity: Number(row['Quantity'] || 0),
                        unitCost: Number(row['Unit Cost'] || 0),
                        extensionCost: Number(row['Extension Cost'] || 0),
                        userAs400: String(row['User'] || ''),
                        mappedAssetId,
                        mappedEmployeeId
                    };
                });

                setPreviewData(mappedData);
                setUploadStatus('idle');
            } catch (error) {
                console.error("Error parsing excel:", error);
                toast.error("Erro ao ler o arquivo Excel.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const parseExcelDate = (excelDate: any): string => {
        // Handle Excel numeric date or string
        if (typeof excelDate === 'number') {
            // Excel date to JS Date
            const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
        }
        // If string YYYY-MM-DD or DD/MM/YYYY
        if (typeof excelDate === 'string') {
            // Basic fallback, maybe use moment/date-fns if needed
            return excelDate;
        }
        return new Date().toISOString().split('T')[0];
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;
        setIsUploading(true);
        try {
            await importConsumablesBatch(previewData);
            setUploadStatus('success');
            toast.success(`${previewData.length} registros importados com sucesso!`);
            setPreviewData([]);
        } catch (error) {
            console.error("Import error:", error);
            setUploadStatus('error');
            toast.error("Erro ao salvar no banco de dados.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Importar Dados AS400</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="max-w-md"
                    />
                    <div className="text-sm text-slate-500">
                        Suporta .xlsx e .xls (Formato Padrão AS400)
                    </div>
                </div>

                {previewData.length > 0 && (
                    <div className="space-y-4">
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Arquivo Pronto</AlertTitle>
                            <AlertDescription>
                                {previewData.length} linhas encontradas.
                                <br />
                                <span className="text-xs text-slate-500">
                                    Lote ID: {previewData[0].importId}
                                </span>
                            </AlertDescription>
                        </Alert>

                        <div className="border rounded-md max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Linha</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Customer (CC)</TableHead>
                                        <TableHead>Area (Origem)</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Custo Total</TableHead>
                                        <TableHead>Mapeamento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.slice(0, 50).map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{row.prodLine}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell>{row.customerCode}</TableCell>
                                            <TableCell>{row.areaSource}</TableCell>
                                            <TableCell>{row.partDescription}</TableCell>
                                            <TableCell>{row.extensionCost.toFixed(2)}</TableCell>
                                            <TableCell>
                                                {row.mappedAssetId ? (
                                                    <span className="text-green-600 text-xs">Shopfloor OK</span>
                                                ) : row.mappedEmployeeId ? (
                                                    <span className="text-blue-600 text-xs">Func. OK</span>
                                                ) : (
                                                    <span className="text-orange-400 text-xs">Sem Vínculo</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleImport} disabled={isUploading}>
                                {isUploading ? "Importando..." : "Confirmar Importação"}
                                <Upload className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
