"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Filter } from "lucide-react";
import { exportQualityReport } from "@/lib/excel-quality";

export function QualityReports() {
    const { qualityCases, assets } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");

    const filteredData = qualityCases.filter(qc => {
        const matchesSearch = qc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            qc.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : qc.status === statusFilter;
        const matchesType = typeFilter === 'all' ? true : qc.type === typeFilter;
        const matchesSeverity = severityFilter === 'all' ? true : qc.severity === severityFilter;

        return matchesSearch && matchesStatus && matchesType && matchesSeverity;
    });

    const handleExport = () => {
        const dataToExport = filteredData.map(qc => ({
            ID: qc.id,
            Data: new Date(qc.createdAt).toLocaleDateString(),
            Status: qc.status,
            Tipo: qc.type,
            Severidade: qc.severity,
            Asset: assets.find(a => a.id === qc.assetId)?.name || qc.assetId,
            Descrição: qc.description,
            Metodologia: qc.methodology,
            Prazo: qc.dueDate ? new Date(qc.dueDate).toLocaleDateString() : '-'
        }));
        exportQualityReport(dataToExport);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filtros Avançados
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Busca Textual</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="investigating">Investigando</SelectItem>
                                    <SelectItem value="action_plan">Plano de Ação</SelectItem>
                                    <SelectItem value="monitoring">Monitoramento</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Tipo</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="internal">Interna</SelectItem>
                                    <SelectItem value="supplier">Fornecedor</SelectItem>
                                    <SelectItem value="warranty">Garantia</SelectItem>
                                    <SelectItem value="audit">Auditoria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Severidade</label>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="critical">Crítica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleExport} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Exportar Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Severidade</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Descrição</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map(qc => (
                                <TableRow key={qc.id}>
                                    <TableCell className="font-mono text-xs">{qc.id}</TableCell>
                                    <TableCell>{new Date(qc.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="capitalize">{qc.status}</TableCell>
                                    <TableCell className="capitalize">{qc.type}</TableCell>
                                    <TableCell className="capitalize">{qc.severity}</TableCell>
                                    <TableCell>{assets.find(a => a.id === qc.assetId)?.name || qc.assetId}</TableCell>
                                    <TableCell className="max-w-md truncate" title={qc.description}>{qc.description}</TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
