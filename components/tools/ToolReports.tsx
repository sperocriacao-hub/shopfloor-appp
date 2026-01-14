"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Wrench, History } from "lucide-react";

export function ToolReports() {
    const { toolTransactions, tools, employees } = useShopfloorStore();

    // Latest first
    const sortedTransactions = [...toolTransactions].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const getToolName = (id: string) => tools.find(t => t.id === id)?.name || "Desconhecida";
    const getToolCode = (id: string) => tools.find(t => t.id === id)?.code || "???";
    const getEmpName = (id?: string) => id ? (employees.find(e => e.id === id)?.name || "N/A") : "-";

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
                            {sortedTransactions.map((tx) => (
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
