"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Briefcase, Award, TrendingUp, AlertTriangle, ArrowRight, ClipboardCheck, UserPlus, Network, CalendarX, Trophy, Star } from "lucide-react";
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

    // --- FILTERS STATE ---
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedArea, setSelectedArea] = useState<string>("all");

    // Derived Areas
    const areas = useMemo(() => Array.from(new Set(employees.map(e => e.area).filter(Boolean))).sort(), [employees]);

    // Derived Available Months (Last 12)
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        // Add current month and last 12
        const d = new Date();
        for (let i = 0; i < 12; i++) {
            months.add(d.toISOString().slice(0, 7));
            d.setMonth(d.getMonth() - 1);
        }
        // Also add from data if existing
        dailyEvaluations.forEach(ev => months.add(ev.date.slice(0, 7)));
        return Array.from(months).sort().reverse();
    }, [dailyEvaluations]);


    // --- FILTERED DATA ---
    const filteredEmployees = useMemo(() => {
        if (selectedArea === 'all') return employees;
        return employees.filter(e => e.area === selectedArea);
    }, [employees, selectedArea]);

    const filteredEvaluations = useMemo(() => {
        return dailyEvaluations.filter(ev => {
            const matchMonth = ev.date.startsWith(selectedMonth);
            if (!matchMonth) return false;

            if (selectedArea === 'all') return true;
            const emp = employees.find(e => e.id === ev.employeeId);
            return emp?.area === selectedArea;
        });
    }, [dailyEvaluations, employees, selectedMonth, selectedArea]);


    // --- KPI CALCULATIONS ---

    // 1. Pillar Ranking (Based on FILTERED evaluations)
    const pillarStats = useMemo(() => {
        const stats = PILLARS.map(p => ({ ...p, total: 0, count: 0, average: 0 }));
        if (filteredEvaluations.length === 0) return stats;

        filteredEvaluations.forEach(ev => {
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
    }, [filteredEvaluations]);

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

    // 3. Top Performers Logic (Based on FILTERED evaluations)
    const topPerformers = useMemo(() => {
        const byEmployee: Record<string, { total: number; count: number }> = {};

        filteredEvaluations.forEach(ev => {
            const sum = PILLARS.reduce((acc, p) => acc + ((ev as any)[p.key] || 0), 0);
            const avg = sum / PILLARS.length;

            if (!byEmployee[ev.employeeId]) {
                byEmployee[ev.employeeId] = { total: 0, count: 0 };
            }
            byEmployee[ev.employeeId].total += avg;
            byEmployee[ev.employeeId].count++;
        });

        const scoredEmployees = Object.keys(byEmployee).map(empId => {
            const emp = employees.find(e => e.id === empId);
            if (!emp) return null;
            const { total, count } = byEmployee[empId];
            return {
                ...emp,
                score: count > 0 ? total / count : 0,
                evalCount: count
            }
        }).filter(Boolean) as (Employee & { score: number, evalCount: number })[];

        // Group by Area
        const byArea: Record<string, typeof scoredEmployees> = {};

        // If sorting by specific Area, we only have one group
        if (selectedArea !== 'all') {
            byArea[selectedArea] = scoredEmployees.sort((a, b) => b.score - a.score);
        } else {
            // Group all
            scoredEmployees.forEach(e => {
                const area = e.area || "Geral";
                if (!byArea[area]) byArea[area] = [];
                byArea[area].push(e);
            });
            Object.keys(byArea).forEach(area => {
                byArea[area].sort((a, b) => b.score - a.score);
            });
        }

        return byArea;
    }, [filteredEvaluations, employees, selectedArea]);


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header & Main Call to Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">RH & Segurança</h1>
                    <p className="text-slate-500 mt-1">Visão geral de desempenho, higiene e segurança da fábrica.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                    <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                    <Button
                        onClick={() => router.push('/staff/list')}
                        variant="outline"
                        className="h-10 px-4 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Gerir Equipa
                    </Button>
                    <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                    <Button
                        onClick={() => router.push('/staff/evaluations')}
                        className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all font-medium"
                    >
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Avaliar
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mês de Referência</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map(m => (
                                <SelectItem key={m} value={m}>{new Date(m + "-01").toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtrar por Área</span>
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Áreas</SelectItem>
                            {areas.map(a => (
                                <SelectItem key={a} value={a}>{a}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                        <p className="text-xs text-slate-500 mt-1">Média do período selecionado</p>
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

                {/* Present Employees (Filtered by Area, but is Real-time) */}
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Presentes Hoje</CardTitle>
                        <Briefcase className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {(filteredEmployees || []).filter(e => {
                                if (e.hrStatus !== 'active') return false;
                                const today = new Date().toISOString().split('T')[0];
                                const hasAbsence = (absenteeismRecords || []).some(r =>
                                    r.employeeId === e.id && r.date === today && (r.type === 'Full Day' || r.type === 'Sick Leave')
                                );
                                return !hasAbsence;
                            }).length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {selectedArea !== 'all' ? `Na área ${selectedArea}` : 'Em toda a fábrica'}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Staff (Filtered by Area) */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Colaboradores</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-700">{filteredEmployees.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Ativos registrados</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
                {/* 1. Ranking de Pilares (2 cols) */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800">Ranking de Desempenho</CardTitle>
                        <CardDescription>Média por Pilar ({new Date(selectedMonth + "-01").toLocaleDateString('pt-PT', { month: 'long' })})</CardDescription>
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
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. Top Performers (3 cols) - UPDATED FOR MURAL */}
                <div className="col-span-1 lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                Destaques do Mês
                            </h2>
                            <p className="text-sm text-slate-500">Ranking baseado na média dos 7 pilares diários.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Object.entries(topPerformers).map(([area, performers]) => {
                            const top3 = performers.slice(0, 3);
                            if (top3.length === 0) return null;
                            const winner = top3[0];
                            const runnersUp = top3.slice(1);

                            return (
                                <div key={area} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative group hover:shadow-md transition-shadow">
                                    {/* Area Header */}
                                    <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-slate-400" />
                                            {area}
                                        </h3>
                                        <Badge variant="outline" className="text-[10px] font-normal bg-white">
                                            {performers.length} Avaliados
                                        </Badge>
                                    </div>

                                    {/* WINNER SPOTLIGHT */}
                                    <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-blue-50/50 to-transparent relative">
                                        <div className="absolute top-4 right-4 animate-pulse">
                                            <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-sm" />
                                        </div>

                                        {/* Avatar / Photo */}
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white">
                                                {winner.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-yellow-200">
                                                1º LUGAR
                                            </div>
                                        </div>

                                        <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{winner.name}</h4>
                                        <p className="text-xs text-slate-500 mb-3">{winner.jobTitle || 'Colaborador'}</p>

                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold text-blue-700">{winner.score.toFixed(1)}</span>
                                            <span className="text-xs text-slate-400">/ 4.0</span>
                                        </div>
                                    </div>

                                    {/* RUNNERS UP */}
                                    {runnersUp.length > 0 && (
                                        <div className="bg-slate-50/50 border-t border-slate-100 p-2 divide-y divide-slate-100">
                                            {runnersUp.map((emp, idx) => (
                                                <div
                                                    key={emp.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-slate-100/50 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/staff/${emp.id}`)}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                                        idx === 0 ? "bg-slate-200 text-slate-700 border-slate-300" : "bg-orange-100 text-orange-800 border-orange-200"
                                                    )}>
                                                        {idx + 2}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex justify-between items-center">
                                                        <p className="text-xs font-semibold text-slate-700 truncate">{emp.name}</p>
                                                        <span className="text-xs font-medium text-slate-500">{emp.score.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Zero State if empty */}
                                    {performers.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-sm">
                                            Sem dados para esta área.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Heatmap Section - Full Width Bottom */}
            <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><TrendingUp className="w-5 h-5" /></span>
                    Mapa de Performance (Longitudinal)
                </h2>
                <FactoryHeatmap data={filteredEvaluations} />
            </div>
        </div>
    );
}
