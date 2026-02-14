"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Activity, Database, AlertTriangle, CheckCircle, Search, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

// List of critical tables to monitor
const CRITICAL_TABLES = [
    // Core
    "assets",
    "products",
    "employees",
    "production_orders",

    // Lean V15-V18
    "lean_projects",
    "lean_audits",
    "lean_actions",
    "daily_evaluations",
    "certifications",
    "employee_certifications",
    "safety_incidents",
    "safety_inspections",

    // Logistics & Materials
    "consumable_transactions",
    "material_requests",
    "scrap_transactions",
    "tool_transactions",
    "ppe_requests",

    // Maintenance & Quality
    "maintenance_orders",
    "mold_maintenance_logs",
    "mold_geometries",
    "quality_cases",
    "quality_actions",
    "scrap_reports",

    // Engineering & Config
    "production_lines",
    "product_parts",
    "order_parts",
    "routings",
    "product_options",
    "cost_center_mappings",

    // IoT
    "rfid_readers",
    "iot_events"
];

type TableHealth = {
    name: string;
    status: "ok" | "error" | "loading";
    count: number | null;
    message?: string;
};

export default function DatabaseDiagnosticsPage() {
    // Health Check State
    const [healthReport, setHealthReport] = useState<TableHealth[]>([]);
    const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);

    // Raw Viewer State
    const [selectedTable, setSelectedTable] = useState<string>("lean_projects");
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);

    // Initial Health Check
    useEffect(() => {
        runHealthCheck();
    }, []);

    // Fetch data when table selection changes
    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable);
        }
    }, [selectedTable]);

    const runHealthCheck = async () => {
        setIsRunningHealthCheck(true);
        const report: TableHealth[] = [];

        // Run sequential checks
        for (const table of CRITICAL_TABLES) {
            const start = performance.now();
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            const end = performance.now();

            if (error) {
                console.warn(`Health Check Warning [${table}]:`, error.message);
                report.push({
                    name: table,
                    status: "error",
                    count: null,
                    message: error.message
                });
            } else {
                report.push({
                    name: table,
                    status: "ok",
                    count: count,
                    message: `${(end - start).toFixed(0)}ms`
                });
            }
        }

        setHealthReport(report);
        setIsRunningHealthCheck(false);

        const errors = report.filter(r => r.status === 'error').length;
        if (errors > 0) {
            toast.warning(`Diagnóstico: ${errors} tabelas com acesso restrito ou inexistentes.`);
        } else {
            toast.success("Diagnóstico concluído. Todas as tabelas acessíveis.");
        }
    };

    const fetchTableData = async (table: string) => {
        setIsLoadingData(true);
        setDataError(null);
        setTableData([]);

        try {
            // Attempt 1: Try sorting by created_at (common)
            let { data, error } = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            // Attempt 2: If error (likely missing column or RLS), try simple select
            if (error) {
                console.warn(`Sort failed for ${table}, trying simple select...`);
                const retry = await supabase.from(table).select('*').limit(20);
                data = retry.data;
                error = retry.error;
            }

            if (error) {
                setDataError(error.message);
                toast.error(`Erro ao ler ${table}: ${error.message}`);
            } else {
                setTableData(data || []);
                if (data && data.length === 0) {
                    toast.info(`Tabela ${table} está vazia.`);
                }
            }
        } catch (e: any) {
            console.error(e);
            setDataError(e.message || "Erro desconhecido");
            toast.error("Erro fatal ao buscar dados.");
        } finally {
            setIsLoadingData(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/admin">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Database className="h-6 w-6 text-blue-600" />
                            Diagnóstico de Banco de Dados
                        </h1>
                    </div>
                    <p className="text-slate-500 pl-10">
                        Ferramenta de inspeção profunda para integridade de dados e permissões (RLS).
                    </p>
                </div>
                <div className="flex gap-2 pl-10 md:pl-0">
                    <Button onClick={runHealthCheck} disabled={isRunningHealthCheck} variant={isRunningHealthCheck ? "secondary" : "default"}>
                        <Activity className={`mr-2 h-4 w-4 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
                        Executar Health Check
                    </Button>
                </div>
            </div>

            {/* Health Report Board */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {healthReport.map((item) => (
                    <Card key={item.name} className={`border-l-4 ${item.status === 'ok' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-xs uppercase truncate w-full" title={item.name}>
                                    {item.name.replace(/_/g, ' ')}
                                </div>
                                {item.status === 'ok' ? (
                                    <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                                ) : (
                                    <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                                )}
                            </div>
                            <div className="text-2xl font-bold text-slate-700">
                                {item.count !== null ? item.count : '-'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate" title={item.message}>
                                {item.message}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {healthReport.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-400 italic">
                        Carregando status do sistema...
                    </div>
                )}
            </div>

            {/* Raw Data Viewer */}
            <Card className="border-slate-300 shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" /> Inspetor de Dados Brutos (Raw Viewer)
                            </CardTitle>
                            <CardDescription>
                                Visualize o conteúdo real gravado no Supabase para confirmar se os dados estão sendo salvos.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={selectedTable} onValueChange={setSelectedTable}>
                                <SelectTrigger className="w-[250px] bg-white">
                                    <SelectValue placeholder="Selecione a Tabela" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CRITICAL_TABLES.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={() => fetchTableData(selectedTable)} disabled={isLoadingData}>
                                <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="bg-slate-900 text-slate-300 font-mono text-xs overflow-auto h-[500px] p-4">
                        {isLoadingData ? (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                            </div>
                        ) : dataError ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
                                <AlertTriangle className="h-8 w-8 mb-2" />
                                <p className="font-bold">Erro ao carregar dados:</p>
                                <p className="font-mono mt-2 bg-red-900/20 p-2 rounded">{dataError}</p>
                            </div>
                        ) : tableData.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Nenhum registro encontrado ou tabela vazia.
                            </div>
                        ) : (
                            <pre>{JSON.stringify(tableData, null, 2)}</pre>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-sm text-yellow-800">Nota sobre Segurança (RLS)</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                        Se uma tabela aparecer com erro ou contagem 0 inesperadamente, pode ser uma regra de segurança (Row Level Security) bloqueando o acesso.
                        Neste caso, o Administrador deve verificar as políticas no painel do Supabase.
                    </p>
                </div>
            </div>
        </div>
    );
}
