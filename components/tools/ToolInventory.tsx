"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, User, AlertTriangle } from "lucide-react";

export function ToolInventory() {
    const { tools, employees } = useShopfloorStore();

    const getHolderName = (id?: string) => {
        if (!id) return "-";
        return employees.find(e => e.id === id)?.name || "Desconhecido";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
            case 'in_use': return <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>;
            case 'maintenance': return <Badge className="bg-orange-100 text-orange-800">Manutenção</Badge>;
            case 'scrapped': return <Badge variant="destructive">Descartada</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Ferramenta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Local / Responsável</TableHead>
                        <TableHead>Condição</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tools.map((tool) => (
                        <TableRow key={tool.id}>
                            <TableCell className="font-mono text-xs">{tool.code}</TableCell>
                            <TableCell className="font-medium">{tool.name}</TableCell>
                            <TableCell>{tool.category}</TableCell>
                            <TableCell>{getStatusBadge(tool.status)}</TableCell>
                            <TableCell>
                                {tool.currentHolderId ? (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <User className="h-3 w-3" />
                                        {getHolderName(tool.currentHolderId)}
                                    </div>
                                ) : (
                                    <span className="text-slate-500">{tool.location}</span>
                                )}
                            </TableCell>
                            <TableCell className="capitalize">{tool.condition}</TableCell>
                        </TableRow>
                    ))}
                    {tools.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                Nenhuma ferramenta cadastrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
