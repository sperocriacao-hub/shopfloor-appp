"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, User, AlertTriangle, Search } from "lucide-react";
import { useState } from "react";

export function ToolInventory() {
    const { tools, employees } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");

    const filteredTools = tools.filter(tool => {
        const matchesSearch =
            tool.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employees.find(e => e.id === tool.currentHolderId)?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || tool.status === statusFilter;
        const matchesCondition = conditionFilter === "all" || tool.condition === conditionFilter;

        return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
    });

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
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-slate-50">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Buscar por código, nome ou responsável..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas Cat.</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Elétrica">Elétrica</SelectItem>
                        <SelectItem value="Bateria">Bateria</SelectItem>
                        <SelectItem value="Pneumática">Pneumática</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="in_use">Em Uso</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Condição" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas Cond.</SelectItem>
                        <SelectItem value="new">Nova</SelectItem>
                        <SelectItem value="good">Boa</SelectItem>
                        <SelectItem value="fair">Razoável</SelectItem>
                        <SelectItem value="poor">Ruim</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                        {filteredTools.map((tool) => (
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
