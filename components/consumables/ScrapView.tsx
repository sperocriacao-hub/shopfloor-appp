"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Trash2, Printer, AlertTriangle, RefreshCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";

export function ScrapView() {
    const { scrapReports, assets, employees } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [reasonFilter, setReasonFilter] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    const filteredReports = useMemo(() => {
        return scrapReports.filter(report => {
            // Search Text
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                (report.itemDescription?.toLowerCase() || "").includes(searchLower) ||
                (report.orderId?.toLowerCase() || "").includes(searchLower) ||
                (report.replacementOrderId?.toLowerCase() || "").includes(searchLower);

            // Reason Filter
            const matchesReason = reasonFilter === 'all' || report.reason === reasonFilter;

            // Date Filter
            let matchesDate = true;
            if (dateRange?.from) {
                const reportDate = parseISO(report.createdAt);
                if (dateRange.to) {
                    matchesDate = isWithinInterval(reportDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
                } else {
                    matchesDate = isWithinInterval(reportDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.from) });
                }
            }

            return matchesSearch && matchesReason && matchesDate;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [scrapReports, searchTerm, reasonFilter, dateRange]);

    const totalQuantity = filteredReports.reduce((sum, r) => sum + r.quantity, 0);
    const totalReplacements = filteredReports.filter(r => r.actionTaken === 'replacement').length;

    // Helper to get asset name
    const getAssetName = (id: string) => assets.find(a => a.id === id)?.name || id;

    // Helper to get employee name
    const getEmployeeName = (idOrName: string) => {
        // Try to find by ID first
        const emp = employees.find(e => e.id === idOrName);
        return emp ? emp.name : idOrName; // Fallback to raw string if reportedBy is just a name
    };

    const reasonLabels: Record<string, string> = {
        'process_fail': 'Falha de Processo',
        'machine_fail': 'Falha de Máquina',
        'material_defect': 'Defeito de Material',
        'operator_error': 'Erro Operacional',
        'setup_part': 'Peça de Setup'
    };

    const actionLabels: Record<string, string> = {
        'recycle': 'Reciclar',
        'trash': 'Descarte',
        'rework': 'Retrabalho',
        'replacement': 'Reposição'
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-500">Total de Itens Perdidos</CardTitle>
                        <div className="text-2xl font-bold text-red-600">{totalQuantity}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-500">Solicitações de Reposição</CardTitle>
                        <div className="text-2xl font-bold text-orange-600">{totalReplacements}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-500">Registros Encontrados</CardTitle>
                        <div className="text-2xl font-bold">{filteredReports.length}</div>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Histórico de Refugo
                    </CardTitle>
                    <CardDescription>Gerencie e analise as perdas de material reportadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Buscar por Item, Ordem..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={reasonFilter} onValueChange={setReasonFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Motivo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Motivos</SelectItem>
                                {Object.entries(reasonLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y", { locale: pt })} -{" "}
                                                {format(dateRange.to, "LLL dd, y", { locale: pt })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y", { locale: pt })
                                        )
                                    ) : (
                                        <span>Filtrar Data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Ordem / Item</TableHead>
                                    <TableHead>Estação</TableHead>
                                    <TableHead>Reportado Por</TableHead>
                                    <TableHead>Qtd</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Ação Tomada</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                            Nenhum registro encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">
                                                {format(parseISO(report.createdAt), 'dd/MM/yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{report.orderId}</div>
                                                <div className="text-xs text-slate-500">{report.itemDescription || "N/A"}</div>
                                            </TableCell>
                                            <TableCell>{getAssetName(report.assetId)}</TableCell>
                                            <TableCell>{getEmployeeName(report.reportedBy || "")}</TableCell>
                                            <TableCell className="font-bold">{report.quantity}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {reasonLabels[report.reason || ''] || report.reason}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1 text-sm">
                                                        {report.actionTaken === 'replacement' ? (
                                                            <RefreshCcw className="h-3 w-3 text-orange-500" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3 text-slate-400" />
                                                        )}
                                                        {actionLabels[report.actionTaken] || report.actionTaken}
                                                    </span>
                                                    {report.replacementOrderId && (
                                                        <span className="text-xs text-blue-600 font-mono">
                                                            Ref: {report.replacementOrderId}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
