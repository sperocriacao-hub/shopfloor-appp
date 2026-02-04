"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Briefcase, Award, TrendingUp, AlertTriangle, ArrowRight, ClipboardCheck, UserX, CheckCircle, Trophy, Star, Medal, UserPlus, Network, CalendarX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { DailyEvaluation, Employee } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FactoryHeatmap } from "@/components/staff/FactoryHeatmap";

// Pillars Configuration (Match Store)
const PILLARS = [
    { key: 'hstScore', label: 'HST', color: 'bg-orange-500', text: 'text-orange-600' },
    { key: 'epiScore', label: 'EPI', color: 'bg-blue-500', text: 'text-blue-600' },
    { key: 'postCleaningScore', label: 'Limpeza (5S)', color: 'bg-green-500', text: 'text-green-600' },
    { key: 'qualityScore', label: 'Qualidade', color: 'bg-purple-500', text: 'text-purple-600' },
    { key: 'efficiencyScore', label: 'Eficiência', color: 'bg-red-500', text: 'text-red-600' },
    { key: 'objectivesScore', label: 'Objetivos', color: 'bg-indigo-500', text: 'text-indigo-600' },
    { key: 'attitudeScore', label: 'Atitude', color: 'bg-pink-500', text: 'text-pink-600' },
] as const;

export default function StaffPage() {
    const router = useRouter();
    const { employees, dailyEvaluations, absenteeismRecords } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");

    // --- KPI CALCULATIONS ---

    // 1. Pillar Ranking (Global)
    const pillarStats = useMemo(() => {
        const stats = PILLARS.map(p => ({ ...p, total: 0, count: 0, average: 0 }));
        if (dailyEvaluations.length === 0) return stats;

        dailyEvaluations.forEach(ev => {
            stats.forEach(s => {
                const val = (ev as any)[s.key];
                if (typeof val === 'number') {
                    s.total += val;
                    s.count++;
                }
            });
        });

        stats.forEach(s => {
            s.average = s.count > 0 ? s.total / s.count : 0;
        });

        return stats.sort((a, b) => a.average - b.average);
    }, [dailyEvaluations]);

    // 2. Organization & Tech Indices
    const organizationIndex = useMemo(() => {
        const cleaningStats = pillarStats.find(p => p.key === 'postCleaningScore');
        return cleaningStats ? cleaningStats.average.toFixed(1) : "0.0";
    }, [pillarStats]);

    const technicalIndex = useMemo(() => {
        const techPillars = ['qualityScore', 'efficiencyScore', 'objectivesScore'];
        const relevant = pillarStats.filter(p => techPillars.includes(p.key));
        const sum = relevant.reduce((acc, curr) => acc + curr.average, 0);
        return relevant.length > 0 ? (sum / relevant.length).toFixed(1) : "0.0";
    }, [pillarStats]);

    // 4. Low Performance Alerts (< 2.0 for 3 consecutive days)
    const lowPerformanceAlerts = useMemo(() => {
        // Group evals by employee
        const byEmployee: Record<string, DailyEvaluation[]> = {};
        dailyEvaluations.forEach(ev => {
            if (!byEmployee[ev.employeeId]) byEmployee[ev.employeeId] = [];
            byEmployee[ev.employeeId].push(ev);
        });

        const alerts: { id: string, name: string, area: string, avg: number }[] = [];

        Object.keys(byEmployee).forEach(empId => {
            // Sort by date desc
            const empEvals = byEmployee[empId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (empEvals.length >= 3) {
                // Check last 3
                const last3 = empEvals.slice(0, 3);
                // Calculate daily averages
                const averages = last3.map(ev => {
                    const sum = PILLARS.reduce((acc, p) => acc + ((ev as any)[p.key] || 0), 0);
                    return sum / PILLARS.length;
                });

                // Check if ALL 3 are < 2.0
                if (averages.every(avg => avg < 2.0)) {
                    const emp = employees.find(e => e.id === empId);
                    if (emp) {
                        alerts.push({
                            id: empId,
                            name: emp.name,
                            area: emp.area || "N/A",
                            avg: averages[0] // Current avg
                        });
                    }
                }
            }
        });
        return alerts;
    }, [dailyEvaluations, employees]);

    // 5. Top Performers Logic
    const topPerformers = useMemo(() => {
        const byEmployee: Record<string, { total: number; count: number }> = {};

        // Calculate average for all
        dailyEvaluations.forEach(ev => {
            const sum = PILLARS.reduce((acc, p) => acc + ((ev as any)[p.key] || 0), 0);
            const avg = sum / PILLARS.length;

            if (!byEmployee[ev.employeeId]) {
                byEmployee[ev.employeeId] = { total: 0, count: 0 };
            }
            byEmployee[ev.employeeId].total += avg;
            byEmployee[ev.employeeId].count++;
        });

        // Map to array with full employee details
        const scoredEmployees = Object.keys(byEmployee).map(empId => {
            const emp = employees.find(e => e.id === empId);
            const { total, count } = byEmployee[empId];
            return {
                ...emp,
                score: count > 0 ? total / count : 0,
                evalCount: count
            }
        }).filter(e => e.score > 0 && e.evalCount >= 3); // Min 3 evals to consider

        // Group by Area
        const byArea: Record<string, typeof scoredEmployees> = {};
        scoredEmployees.forEach(e => {
            const area = e.area || "Geral";
            if (!byArea[area]) byArea[area] = [];
            byArea[area].push(e);
        });

        // Sort each area
        Object.keys(byArea).forEach(area => {
            byArea[area].sort((a, b) => b.score - a.score);
        });

        return byArea;
    }, [dailyEvaluations, employees]);


    // Filter for directory list
    const filteredEmployees = (employees || []).filter(e => {
        const matchesSearch = (e.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.workerNumber || "").includes(searchTerm) ||
            (e.area || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && e.hrStatus === 'active';
    });


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header & Main Call to Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">RH & Segurança</h1>
                    <p className="text-slate-500 mt-1">Visão geral de desempenho, higiene e segurança da fábrica.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Navigation / Management Group */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => router.push('/staff/absenteeism')}
                            variant="outline"
                            className="h-10 px-4 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                        >
                            <CalendarX className="mr-2 h-4 w-4" />
                            Absentismo
                        </Button>
                        <Button
                            onClick={() => router.push('/staff/org-chart')}
                            variant="outline"
                            className="h-10 px-4 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                        >
                            <Network className="mr-2 h-4 w-4" />
                            Organograma
                        </Button>
                        <Button
                            onClick={() => router.push('/staff/list')}
                            variant="outline"
                            className="h-10 px-4 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Gerir Equipa
                        </Button>
                    </div>

                    {/* Separator for larger screens */}
                    <div className="hidden md:block h-8 w-px bg-slate-200 mx-1"></div>

                    {/* Primary Actions Group */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => router.push('/staff/evaluations')}
                            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all font-medium"
                        >
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            Avaliar
                        </Button>
                        <Button
                            onClick={() => router.push('/staff/new')}
                            className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow transition-all font-medium"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Novo
                        </Button>
                    </div>
                </div>
            </div>

            {/* Top KPIs Row */}
            <div className="grid gap-6 md:grid-cols-4">
                {/* Organization Index */}
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Índice de Organização (5S)</CardTitle>
                        <Award className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{organizationIndex}</div>
                        <p className="text-xs text-slate-500 mt-1">Média de Limpeza do Posto</p>
                    </CardContent>
                </Card>

                {/* Technical Performance */}
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Performance Técnica</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{technicalIndex}</div>
                        <p className="text-xs text-slate-500 mt-1">Qualidade + Eficiência + Objetivos</p>
                    </CardContent>
                </Card>

                {/* Present Employees */}
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Colaboradores Presentes</CardTitle>
                        <Briefcase className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {(employees || []).filter(e => {
                                if (e.hrStatus !== 'active') return false;
                                const today = new Date().toISOString().split('T')[0];
                                const hasAbsence = (absenteeismRecords || []).some(r =>
                                    r.employeeId === e.id && r.date === today && (r.type === 'Full Day' || r.type === 'Sick Leave')
                                );
                                return !hasAbsence;
                            }).length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Disponíveis no chão de fábrica</p>
                    </CardContent>
                </Card>

                {/* Total Staff */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total HC</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-700">{employees.length}</div>
                        <Button variant="link" onClick={() => router.push('/staff/org-chart')} className="px-0 text-xs h-auto text-blue-600">
                            Ver Organograma <ArrowRight className="ml-1 w-3 h-3" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Ranking de Pilares (Main KPI) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800">Ranking de Desempenho (Pilares)</CardTitle>
                        <CardDescription>Identificação de áreas críticas (Menor pontuação no topo)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pillarStats.map((stat, index) => (
                            <div key={stat.key} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                        {stat.label}
                                    </span>
                                    <span className={cn("font-bold", stat.average < 2.5 ? "text-red-600" : "text-slate-700")}>
                                        {stat.average.toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", stat.color)}
                                        style={{ width: `${(stat.average / 4) * 100}%` }}
                                    ></div>
                                </div>
                                {index === 0 && (
                                    <p className="text-xs text-red-500 flex items-center mt-1">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Atenção Crítica: Formação recomendada neste pilar.
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. Low Performance Alerts & Quick Actions */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <Card className="border-red-100 bg-red-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Alertas de Baixo Desempenho
                            </CardTitle>
                            <CardDescription className="text-red-700">
                                Colaboradores com média &lt; 2.0 por 3 dias consecutivos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowPerformanceAlerts.length === 0 ? (
                                <div className="flex items-center justify-center p-6 text-slate-500 italic text-sm border border-dashed rounded bg-white/50">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Nenhum alerta crítico detectado.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lowPerformanceAlerts.map(alert => (
                                        <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded border border-red-200 shadow-sm">
                                            <div>
                                                <p className="font-bold text-slate-800">{alert.name}</p>
                                                <p className="text-xs text-slate-500">{alert.area}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-red-600 font-bold text-lg">{alert.avg.toFixed(1)}</span>
                                                <p className="text-[10px] text-slate-400">Média (3d)</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Heatmap Section */}
                    <div className="mt-8 col-span-full">
                        <FactoryHeatmap />
                    </div>

                    {/* Top Performers Section */}
                    <div className="mt-8 col-span-full space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Melhores Profissionais (Top 3 por Área)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(topPerformers).map(([area, performers]) => {
                                const top3 = performers.slice(0, 3);
                                if (top3.length === 0) return null;

                                return (
                                    <Card key={area} className="border-slate-200 overflow-hidden">
                                        <CardHeader className="bg-slate-50 py-3 border-b">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">{area}</CardTitle>
                                                <Badge variant="outline" className="bg-white text-xs font-normal">
                                                    Funcionário do Mês
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {top3.map((emp, idx) => (
                                                <div key={emp.id} className={cn(
                                                    "flex items-center gap-3 p-3 border-b last:border-0 hover:bg-slate-50 transition-colors",
                                                    idx === 0 ? "bg-yellow-50/50" : ""
                                                )}>
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                                                        idx === 0 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                                                            idx === 1 ? "bg-slate-100 text-slate-700 border border-slate-200" :
                                                                "bg-orange-50 text-orange-700 border border-orange-200"
                                                    )}>
                                                        {idx + 1}º
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate text-slate-900">{emp.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{emp.role}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-blue-700">{emp.score.toFixed(2)}</span>
                                                        <div className="flex text-[10px] text-slate-400 gap-0.5 justify-end">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    {/* Quick Access List (Mini Directory) */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-md font-semibold text-slate-800">Diretório Rápido</CardTitle>
                                <div className="relative w-[180px]">
                                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        placeholder="Buscar..."
                                        className="w-full pl-8 h-8 text-xs bg-slate-50 border rounded outline-none focus:ring-1 focus:ring-blue-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Nome</th>
                                        <th className="px-4 py-2">Área</th>
                                        <th className="px-4 py-2 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredEmployees.slice(0, 10).map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 font-medium text-slate-700 truncate max-w-[120px]">{emp.name}</td>
                                            <td className="px-4 py-2 text-slate-500 text-xs">{emp.area}</td>
                                            <td className="px-4 py-2 text-right">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => router.push(`/staff/${emp.id}`)} title="Ver Perfil">
                                                    <Search className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                        <tr><td colSpan={3} className="p-4 text-center text-slate-400">Nenhum encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                            {filteredEmployees.length > 10 && (
                                <div className="p-2 text-center text-xs text-slate-400 border-t">
                                    + {filteredEmployees.length - 10} outros funcionários...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


        </div>
    );
}
