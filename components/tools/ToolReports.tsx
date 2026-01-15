"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Wrench, History } from "lucide-react";
import { useState } from "react";

export function ToolReports() {
    const { toolTransactions, tools, employees } = useShopfloorStore();

    // Latest first
    const sortedTransactions = [...toolTransactions].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const getToolName = (id: string) => tools.find(t => t.id === id)?.name || "Desconhecida";
    const getToolCode = (id: string) => tools.find(t => t.id === id)?.code || "???";
    const getEmpName = (id?: string) => id ? (employees.find(e => e.id === id)?.name || "N/A") : "-";

    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");

    // Filter Logic
    const filteredTransactions = sortedTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
        const tool = tools.find(t => t.id === tx.toolId);
        const emp = employees.find(e => e.id === tx.employeeId);

        // Date Check
        if (dateStart && txDate < dateStart) return false;
        if (dateEnd && txDate > dateEnd) return false;

        // Action Check
        if (actionFilter !== "all" && tx.action !== actionFilter) return false;

        // Search Check (Code, Tool Name, Emp Name)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchCode = tool?.code.toLowerCase().includes(term);
            const matchName = tool?.name.toLowerCase().includes(term);
            const matchEmp = emp?.name.toLowerCase().includes(term);
            if (!matchCode && !matchName && !matchEmp) return false;
        }

        return true;
    });

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'checkout': return <Badge className="bg-blue-100 text-blue-800 flex w-fit gap-1"><ArrowUpRight size={12} /> Saída</Badge>;
            case 'checkin': return <Badge className="bg-green-100 text-green-800 flex w-fit gap-1"><ArrowDownLeft size={12} /> Devolução</Badge>;
            case 'maintenance_out': return <Badge className="bg-orange-100 text-orange-800 flex w-fit gap-1"><Wrench size={12} /> Manutenção</Badge>;
            default: return <Badge variant="outline">{action}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Movimentações (Log)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 mb-4 p-4 border rounded-md bg-slate-50">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500">De:</span>
                        <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-white w-[150px]" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500">Até:</span>
                        <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-white w-[150px]" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <span className="text-xs font-medium text-slate-500">Busca:</span>
                        <Input
                            placeholder="Código, Ferramenta ou Funcionário..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500">Tipo:</span>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Ações</SelectItem>
                                <SelectItem value="checkout">Saídas</SelectItem>
                                <SelectItem value="checkin">Devoluções</SelectItem>
                                <SelectItem value="maintenance_out">Envio Manutenção</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Ação</TableHead>
                                <TableHead>Ferramenta</TableHead>
                                <TableHead>Funcionário</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead>Realizado Por</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-xs">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getActionBadge(tx.action)}</TableCell>
                                    <TableCell>
                                        <div className="font-mono text-xs">{getToolCode(tx.toolId)}</div>
                                        <div className="text-xs text-muted-foreground">{getToolName(tx.toolId)}</div>
                                    </TableCell>
                                    <TableCell>{getEmpName(tx.employeeId)}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={tx.notes}>{tx.notes}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{tx.createdBy || 'Sistema'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
