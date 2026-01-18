"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Search, User, Eye } from "lucide-react";

export function PPIView() {
    const { consumableTransactions, employees } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");

    // Filter only PPI transactions
    const ppiTransactions = consumableTransactions.filter(tx => tx.prodLine === 'PPI');

    // Group by Employee (mappedEmployeeId or areaSource fallback)
    const groupedData = ppiTransactions.reduce((acc, tx) => {
        const key = tx.mappedEmployeeId || tx.areaSource;
        if (!acc[key]) {
            acc[key] = {
                id: key,
                employeeId: tx.mappedEmployeeId,
                workerNumber: tx.areaSource, // Assuming raw area contains worker number
                name: tx.mappedEmployeeId
                    ? employees.find(e => e.id === tx.mappedEmployeeId)?.name
                    : `Desconhecido (${tx.areaSource})`,
                jobTitle: tx.mappedEmployeeId
                    ? employees.find(e => e.id === tx.mappedEmployeeId)?.jobTitle
                    : '-',
                totalCost: 0,
                itemCount: 0,
                transactions: [] as typeof ppiTransactions
            };
        }
        acc[key].totalCost += tx.extensionCost;
        acc[key].itemCount += 1;
        acc[key].transactions.push(tx);
        return acc;
    }, {} as Record<string, any>);

    const employeeList = Object.values(groupedData)
        .sort((a, b) => b.totalCost - a.totalCost) // High spenders first
        .filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(emp.workerNumber).includes(searchTerm));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Buscar funcionário..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-md bg-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employeeList.map((emp) => (
                    <Card key={emp.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="py-4 pb-2">
                            <CardTitle className="text-base flex justify-between items-start">
                                <div className="flex gap-2 items-center">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span className="truncate max-w-[180px]" title={emp.name}>{emp.name}</span>
                                </div>
                                <span className="text-green-600 font-bold">€ {emp.totalCost.toFixed(2)}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-sm text-slate-500 mb-2">
                                {emp.jobTitle} • {emp.itemCount} itens
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Eye className="mr-2 h-3 w-3" /> Ver Detalhes
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Consumo de EPIs: {emp.name}</DialogTitle>
                                    </DialogHeader>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead className="text-right">Qtd</TableHead>
                                                <TableHead className="text-right">Custo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {emp.transactions.map((tx: any) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell>{tx.date}</TableCell>
                                                    <TableCell className="font-mono text-xs">{tx.partNumber}</TableCell>
                                                    <TableCell>{tx.partDescription}</TableCell>
                                                    <TableCell className="text-right">{tx.quantity}</TableCell>
                                                    <TableCell className="text-right">€ {tx.extensionCost.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
