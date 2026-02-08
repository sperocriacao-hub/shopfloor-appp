"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet, Database, ArrowRightLeft } from "lucide-react";
import Papa from "papaparse";

export default function SyncCenterPage() {
    const store = useShopfloorStore();
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'consumables') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    console.log("Parsed Data:", results.data);
                    await store.importAS400Data(type, results.data);
                } catch (error) {
                    toast.error("Erro ao processar dados.");
                } finally {
                    setIsImporting(false);
                }
            },
            error: (error) => {
                toast.error("Erro ao ler CSV: " + error.message);
                setIsImporting(false);
            }
        });
    };

    const handleExport = async (type: 'scrap' | 'requests') => {
        setIsExporting(true);
        try {
            // Filter pending items
            const dataToExport = type === 'scrap'
                ? store.scrapTransactions.filter(t => t.status === 'approved')
                : store.materialRequests.filter(r => r.status === 'approved');

            if (dataToExport.length === 0) {
                toast.info("Nenhum registro pendente para exportação.");
                return;
            }

            // Convert to CSV
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // Trigger Download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `AS400_EXPORT_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Mark as Exported in DB
            const now = new Date().toISOString();
            if (type === 'scrap') {
                for (const item of dataToExport) {
                    await store.updateScrapTransaction(item.id, { status: 'exported', exportedAt: now });
                }
            }

            toast.success(`Exportação de ${dataToExport.length} registros concluída!`);
        } catch (error) {
            console.error(error);
            toast.error("Erro na exportação");
        } finally {
            setIsExporting(false);
        }
    };

    const pendingScrap = store.scrapTransactions.filter(t => t.status === 'approved').length;
    const pendingRequests = store.materialRequests.filter(r => r.status === 'approved').length;

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
                    <div className="text-sm font-medium text-slate-500">Registros em Cache</div>
                    <div className="text-lg font-mono font-bold text-slate-800">
                        {store.as400Items?.length || 0} Itens
                    </div>
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
                                <p className="text-xs text-slate-500 mb-3">Requer export CSV (Headers: Part Number, Description, Standard Cost)</p>
                                <div className="flex gap-4">
                                    <Input
                                        type="file"
                                        accept=".csv"
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
                                        accept=".csv"
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
                            Gerar arquivos CSV para importação na contabilidade no AS400.
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
                                <span className="text-xs font-normal">Aprovados: {pendingScrap} registros</span>
                            </Button>

                            <Button
                                className="h-24 flex flex-col gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border"
                                variant="outline"
                                onClick={() => handleExport('requests')}
                                disabled={isExporting}
                            >
                                <FileSpreadsheet className="w-8 h-8" />
                                <span className="font-bold">Exportar Pedidos</span>
                                <span className="text-xs font-normal">Aprovados: {pendingRequests} pedidos</span>
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
