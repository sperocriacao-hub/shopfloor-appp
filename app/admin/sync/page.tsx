"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet, RefreshCw, Database, ArrowRightLeft } from "lucide-react";

export default function SyncCenterPage() {
    const store = useShopfloorStore();
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Placeholder for file handling logic
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'consumables') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            // Simulator for now - typically we'd parse CSV here
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success(`Importação do AS400 (${type}) concluída com sucesso!`);
            // In real impl: store.importData(parsedData);
        } catch (error) {
            toast.error("Erro na importação: " + String(error));
        } finally {
            setIsImporting(false);
        }
    };

    const handleExport = async (type: 'scrap' | 'requests') => {
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Arquivo de Exportação (${type}) gerado!`);
            // In real impl: generateCSV(data);
        } catch (error) {
            toast.error("Erro na exportação");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 fade-in animate-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-blue-600" />
                        Central de Sincronização AS400
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Ponte de dados entre o Shopfloor App e o ERP legado.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-slate-500">Última Sincronização</div>
                    <div className="text-lg font-mono font-bold text-slate-800">Hoje, 10:42</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* INBOUND: AS400 -> Shopfloor */}
                <Card className="border-l-4 border-l-blue-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Download className="w-5 h-5" />
                            Importar Dados (Inbound)
                        </CardTitle>
                        <CardDescription>
                            Carregar "Master Data" do AS400 para atualizar custos e listas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <Label className="text-base font-semibold">Atualizar Artigos & Custos (BOM)</Label>
                                <p className="text-xs text-slate-500 mb-3">Requer export CSV 'ITMMST' ou similar.</p>
                                <div className="flex gap-4">
                                    <Input
                                        type="file"
                                        accept=".csv,.xlsx"
                                        className="cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'products')}
                                        disabled={isImporting}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <Label className="text-base font-semibold">Atualizar Consumíveis</Label>
                                <p className="text-xs text-slate-500 mb-3">Requer export lista de preços de consumíveis.</p>
                                <div className="flex gap-4">
                                    <Input
                                        type="file"
                                        accept=".csv,.xlsx"
                                        className="cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'consumables')}
                                        disabled={isImporting}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* OUTBOUND: Shopfloor -> AS400 */}
                <Card className="border-l-4 border-l-green-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Upload className="w-5 h-5" />
                            Exportar Movimentos (Outbound)
                        </CardTitle>
                        <CardDescription>
                            Gerar arquivos para contabilidade no AS400.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                className="h-24 flex flex-col gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 border"
                                variant="outline"
                                onClick={() => handleExport('scrap')}
                                disabled={isExporting}
                            >
                                <Database className="w-8 h-8" />
                                <span className="font-bold">Exportar SCRAP</span>
                                <span className="text-xs font-normal">Pendentes: 12 registros</span>
                            </Button>

                            <Button
                                className="h-24 flex flex-col gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border"
                                variant="outline"
                                onClick={() => handleExport('requests')}
                                disabled={isExporting}
                            >
                                <FileSpreadsheet className="w-8 h-8" />
                                <span className="font-bold">Exportar Pedidos</span>
                                <span className="text-xs font-normal">Pendentes: 5 pedidos</span>
                            </Button>
                        </div>

                        <div className="bg-amber-50 p-4 rounded border border-amber-200 text-xs text-amber-800">
                            <strong>Nota:</strong> A exportação marcará os registros como "Exportados" no banco de dados e eles sairão da lista de pendências.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
