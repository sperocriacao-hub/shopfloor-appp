"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export function PPIReports() {
    const { ppeRequests, employees, assets } = useShopfloorStore();

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [employeeFilter, setEmployeeFilter] = useState("all");
    const [assetFilter, setAssetFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter Logic
    const filteredRequests = ppeRequests.filter(req => {
        const reqDate = new Date(req.requestDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Date Check
        if (start && reqDate < start) return false;
        if (end && reqDate > end) return false;

        // Employee Check
        if (employeeFilter !== "all" && req.employeeId !== employeeFilter) return false;

        // Asset Check
        if (assetFilter !== "all" && req.assetId !== assetFilter) return false;

        // Status Check
        if (statusFilter !== "all" && req.status !== statusFilter) return false;

        return true;
    });

    const handlePrint = () => {
        const printContent = document.getElementById("ppi-reports-table");
        if (printContent) {
            const win = window.open("", "", "height=700,width=1000");
            if (win) {
                win.document.write("<html><head><title>Relatório de Pedidos de EPI</title>");
                win.document.write(`<style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                    th { background-color: #f2f2f2; }
                    h1 { font-size: 18px; margin-bottom: 5px; }
                    p { font-size: 12px; color: #666; }
                </style>`);
                win.document.write("</head><body>");
                win.document.write(`<h1>Relatório de Pedidos (PPI/EPI)</h1>`);
                win.document.write(`<p>Gerado em: ${new Date().toLocaleString('pt-PT')} | Registros: ${filteredRequests.length}</p>`);
                win.document.write(printContent.outerHTML);
                win.document.write("</body></html>");
                win.document.close();
                win.print();
            }
        }
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredRequests.map(req => {
            const empName = req.employeeId ? employees.find(e => e.id === req.employeeId)?.name : '-';
            const assetName = req.assetId ? assets.find(a => a.id === req.assetId)?.name : '-';

            return {
                Date: format(new Date(req.requestDate), 'dd/MM/yyyy HH:mm'),
                Employee: empName,
                Area: assetName,
                Item: req.itemName,
                PartNumber: req.partNumber,
                Quantity: req.quantity,
                Status: req.status,
                Notes: req.notes
            };
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatório PPI");
        XLSX.writeFile(wb, "Relatorio_PPI.xlsx");
    };

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-slate-50 items-end">
                <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Início</span>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[140px] bg-white" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Fim</span>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[140px] bg-white" />
                </div>

                <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Funcionário</span>
                    <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                        <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {employees.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Área</span>
                    <Select value={assetFilter} onValueChange={setAssetFilter}>
                        <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {assets.map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">Status</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="processed">Processado</SelectItem>
                            <SelectItem value="delivered">Entregue</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="outline" onClick={handleExport} className="ml-auto">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
            </div>

            {/* Results Table */}
            <div className="border rounded-md">
                <Table id="ppi-reports-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Área</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Obs</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    Nenhum pedido encontrado com os filtros selecionados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map(req => {
                                // Resolve Names
                                const empName = req.employeeId ? employees.find(e => e.id === req.employeeId)?.name : '-';
                                const assetName = req.assetId ? assets.find(a => a.id === req.assetId)?.name : '-';

                                return (
                                    <TableRow key={req.id}>
                                        <TableCell>{format(new Date(req.requestDate), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell>{empName}</TableCell>
                                        <TableCell>{assetName}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{req.itemName}</div>
                                            {req.partNumber && <div className="text-xs text-slate-500">{req.partNumber}</div>}
                                        </TableCell>
                                        <TableCell>{req.quantity}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${req.status === 'processed' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${req.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                                                ${req.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                            `}>
                                                {req.status === 'pending' && 'Pendente'}
                                                {req.status === 'processed' && 'No AS400'}
                                                {req.status === 'delivered' && 'Entregue'}
                                                {req.status === 'rejected' && 'Rejeitado'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={req.notes}>{req.notes}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
