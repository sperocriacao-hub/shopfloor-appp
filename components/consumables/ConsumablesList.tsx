"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Search } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface ConsumablesListProps {
    type: 'INT' | 'PCS' | 'PST';
    title: string;
}

export function ConsumablesList({ type, title }: ConsumablesListProps) {
    const { consumableTransactions, assets, costCenterMappings } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [areaFilter, setAreaFilter] = useState("all");

    // Filter by Type
    const baseData = consumableTransactions.filter(tx => tx.prodLine === type);

    // Get Unique Mapped Assets for Filter
    const uniqueAssetIds = Array.from(new Set(baseData.map(tx => tx.mappedAssetId).filter(Boolean)));
    const uniqueAssets = assets.filter(a => uniqueAssetIds.includes(a.id));

    // Filter Logic
    const filteredData = baseData.filter(tx => {
        const matchesSearch =
            tx.partDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.partNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesArea = areaFilter === "all" || tx.mappedAssetId === areaFilter;

        return matchesSearch && matchesArea;
    });

    const totalCost = filteredData.reduce((sum, tx) => sum + tx.extensionCost, 0);

    const handlePrint = () => {
        const printContent = document.getElementById(`print-table-${type}`);
        if (printContent) {
            const win = window.open("", "", "height=700,width=1000");
            if (win) {
                win.document.write("<html><head><title>Relatório de Consumo</title>");
                win.document.write(`<style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                    th { background-color: #f2f2f2; }
                    h1 { font-size: 18px; margin-bottom: 5px; }
                    p { font-size: 12px; color: #666; }
                </style>`);
                win.document.write("</head><body>");
                win.document.write(`<h1>${title} - Relatório de Consumo</h1>`);
                win.document.write(`<p>Total Registros: ${filteredData.length} | Custo Total: € ${totalCost.toFixed(2)}</p>`);
                win.document.write(printContent.outerHTML);
                win.document.write("</body></html>");
                win.document.close();
                win.print();
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-slate-50 items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Buscar descrição ou part number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white pl-9"
                        />
                    </div>

                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                        <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Filtrar por Área" /></SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="all">Todas as Áreas</SelectItem>
                            {uniqueAssets.map(asset => (
                                <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                        Total: <span className="text-lg font-bold text-green-600">€ {totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </div>
            </div>

            <div className="border rounded-md max-h-[600px] overflow-auto">
                <Table id={`print-table-${type}`}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Semana</TableHead>
                            <TableHead>Centro de Custo (Origem)</TableHead>
                            <TableHead>Área Mapeada</TableHead>
                            <TableHead>Part Number</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Custo (€)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                                <TableCell>{row.week}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{row.customerCode}</span>
                                        <span className="text-[10px] text-slate-500">{row.areaSource}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {row.mappedAssetId ? (
                                        assets.find(a => a.id === row.mappedAssetId)?.name
                                    ) : (
                                        <span className="text-orange-400 text-xs italic">Não Mapeado</span>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">{row.partNumber}</TableCell>
                                <TableCell className="max-w-[300px] truncate" title={row.partDescription}>{row.partDescription}</TableCell>
                                <TableCell className="text-right">{row.quantity}</TableCell>
                                <TableCell className="text-right font-medium">{row.extensionCost.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
