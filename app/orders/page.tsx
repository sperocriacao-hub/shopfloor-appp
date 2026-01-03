"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Activity, Calendar, FileSpreadsheet, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { useState } from "react";

export default function OrdersPage() {
    const { orders, products, routings, createOrder } = useShopfloorStore();
    const [isImporting, setIsImporting] = useState(false);

    const handleDownloadTemplate = () => {
        const headers = ["Product Name", "Quantity", "PO", "PP", "HIN", "PARTN", "Start Date (YYYY-MM-DD)", "Finish Date (YYYY-MM-DD)", "Country", "BR", "Customer"];
        const sampleData = [
            ["Interceptor 40", 1, "PO-12345", "PP-987", "PT-ABC...", "PN-555", "2026-01-10", "2026-02-15", "Portugal", "BR-01", "Cliente Exemplo"]
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
        XLSX.writeFile(wb, "modelo_ordens_producao.xlsx");
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Skip header row
                const rows = data.slice(1) as any[];

                rows.forEach((row) => {
                    if (!row[0]) return; // Skip empty rows

                    // Lookup product by name (row[0])
                    const productName = row[0];
                    const product = products.find(p => p.name.toLowerCase() === productName.toString().toLowerCase());

                    if (product) {
                        const newOrder = {
                            id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            productModelId: product.id,
                            quantity: Number(row[1]) || 1,
                            status: 'planned' as const,
                            currentOperationId: undefined,
                            po: row[2]?.toString(),
                            pp: row[3]?.toString(),
                            hin: row[4]?.toString(),
                            partn: row[5]?.toString(),
                            startDate: row[6] ? new Date(row[6]) : new Date(),
                            finishDate: row[7] ? new Date(row[7]) : undefined,
                            country: row[8]?.toString(),
                            br: row[9]?.toString(),
                            customer: row[10]?.toString(),
                        };
                        createOrder(newOrder);
                    }
                });

                alert("Importação concluída com sucesso!");
            } catch (error) {
                console.error("Erro ao importar Excel:", error);
                alert("Erro ao processar arquivo. Verifique se segue o modelo.");
            } finally {
                setIsImporting(false);
                if (e.target) e.target.value = ''; // Reset input
            }
        };
        reader.readAsBinaryString(file);
    };

    const getProduct = (id: string) => products.find(p => p.id === id);
    const getProgress = (orderId: string, productId: string) => {
        // Mock calculation based on routing ops vs current op
        // Simplified for prototype
        return 33;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900">Ordens de Produção</h1>
                    <p className="text-slate-500">Gestão de Execução: Acompanhe o progresso do chão de fábrica.</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleDownloadTemplate} disabled={isImporting}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Baixar Modelo
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImport}
                            disabled={isImporting}
                        />
                        <Button variant="outline" disabled={isImporting}>
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Importar Excel
                        </Button>
                    </div>
                    <Link href="/orders/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Ordem
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6">
                {orders.map((order) => {
                    const product = getProduct(order.productModelId);
                    return (
                        <Card key={order.id} className="overflow-hidden hover:border-blue-300 transition-colors">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-mono font-bold text-slate-400">#{order.id}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-bold",
                                            order.status === 'in_progress' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {order.status === 'in_progress' ? 'Em Andamento' : order.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-blue-900">{product?.name}</h3>
                                    <p className="text-sm text-slate-500 flex items-center">
                                        <Activity className="mr-1 h-4 w-4" />
                                        Operação Atual: {order.currentOperationId ? 'Laminação de Casco (Op. 20)' : 'Não iniciada'}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Progresso</p>
                                        <p className="text-2xl font-bold text-slate-700">33%</p>
                                    </div>
                                    <Link href={`/orders/${order.id}`}>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            Abrir Cockpit
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-2 border-t flex items-center text-xs text-slate-500 space-x-4">
                                <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Início: 03/01/2026
                                </span>
                                <span>
                                    Entrega Est.: 15/01/2026
                                </span>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
