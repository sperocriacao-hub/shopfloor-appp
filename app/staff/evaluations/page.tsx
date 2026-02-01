"use client";

import { useState, useEffect, useMemo } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { HardHat, Shield, Activity, TrendingUp, CheckCircle, Save, Check, ChevronsUpDown, Search, AlertOctagon, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { DailyEvaluation, Employee } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Pillars Configuration
const PILLARS = [
    { key: 'hstScore', label: 'HST', icon: HardHat, color: 'text-orange-500' },
    { key: 'epiScore', label: 'EPI', icon: Shield, color: 'text-blue-500' },
    { key: 'postCleaningScore', label: 'Limpeza (5S)', icon: Activity, color: 'text-green-500' },
    { key: 'qualityScore', label: 'Qualidade', icon: CheckCircle, color: 'text-purple-500' },
    { key: 'efficiencyScore', label: 'Eficiência', icon: TrendingUp, color: 'text-red-500' },
    { key: 'objectivesScore', label: 'Objetivos', icon: CheckCircle, color: 'text-indigo-500' },
    { key: 'attitudeScore', label: 'Atitude', icon: Activity, color: 'text-pink-500' },
] as const;

export default function DailyEvaluationsPage() {
    const { employees, currentUser, addEvaluation, dailyEvaluations } = useShopfloorStore();
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Evaluation State: { [employeeId]: Partial<DailyEvaluation> }
    const [evaluations, setEvaluations] = useState<Record<string, Partial<DailyEvaluation>>>({});

    // Track saved state for visual feedback: { [employeeId]: boolean }
    const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});

    // Memoize areas to avoid recalculation
    const areas = useMemo(() =>
        Array.from(new Set(employees.map(e => e.area).filter(Boolean))).sort(),
        [employees]);

    // Optimize: Filter first, then load data for ONLY those employees
    const filteredEmployees = useMemo(() => {
        if (!selectedArea) return [];
        return employees
            .filter(e => e.hrStatus === 'active' && e.area === selectedArea)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [employees, selectedArea]);

    // Load existing evaluations ONLY when filtered list changes (i.e. Area selected)
    useEffect(() => {
        if (filteredEmployees.length === 0) return;

        const today = new Date().toISOString().split('T')[0];
        // Optimization: Filter from store only relevant evals
        const relevantEmpIds = new Set(filteredEmployees.map(e => e.id));
        const todaysEvals = dailyEvaluations.filter(e => e.date === today && relevantEmpIds.has(e.employeeId));

        const initialState: Record<string, Partial<DailyEvaluation>> = {};
        todaysEvals.forEach(e => {
            initialState[e.employeeId] = { ...e };
        });

        // Preserve existing local edits if any (though typically user switching area resets visual state)
        // Be careful not to overwrite user work if they switch back and forth. 
        // For simplicity/perf: We merge.
        setEvaluations(prev => ({ ...prev, ...initialState }));
    }, [filteredEmployees, dailyEvaluations]); // Depend on filteredEmployees to trigger on area switch

    const handleScoreChange = (employeeId: string, pillarKey: string, value: number) => {
        setEvaluations(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [pillarKey]: value
            }
        }));
        setSavedStates(prev => ({ ...prev, [employeeId]: false }));
    };

    const handleNoteChange = (employeeId: string, note: string) => {
        setEvaluations(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                notes: note
            }
        }));
        setSavedStates(prev => ({ ...prev, [employeeId]: false }));
    };

    const calculateDailyScore = (evalData: Partial<DailyEvaluation> | undefined) => {
        if (!evalData) return 0;
        const sum = PILLARS.reduce((acc, p) => {
            const val = (evalData as any)[p.key];
            return acc + (val !== undefined ? val : 3);
        }, 0);
        return (sum / 7).toFixed(1);
    };

    const getScoreColor = (score: number) => {
        if (score >= 3.5) return "bg-green-100 text-green-700 border-green-300";
        if (score >= 2.5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
        return "bg-red-100 text-red-700 border-red-300";
    };

    const submitEvaluation = (employee: Employee) => {
        const evalData = evaluations[employee.id];
        const newEval: DailyEvaluation = {
            id: evalData?.id || `eval-${Date.now()}-${employee.id}`,
            employeeId: employee.id,
            supervisorId: currentUser?.id,
            date: new Date().toISOString().split('T')[0],
            hstScore: evalData?.hstScore ?? 3,
            epiScore: evalData?.epiScore ?? 3,
            postCleaningScore: evalData?.postCleaningScore ?? 3,
            qualityScore: evalData?.qualityScore ?? 3,
            efficiencyScore: evalData?.efficiencyScore ?? 3,
            objectivesScore: evalData?.objectivesScore ?? 3,
            attitudeScore: evalData?.attitudeScore ?? 3,
            notes: evalData?.notes || "",
            createdAt: evalData?.createdAt || new Date().toISOString()
        };

        addEvaluation(newEval);
        toast.success(`Avaliação de ${employee.name} salva!`);
        setSavedStates(prev => ({ ...prev, [employee.id]: true }));
    };

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-32">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4 sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Avaliação Diária de Equipe</h1>
                        <p className="text-slate-500 text-sm">Selecione a área para iniciar as avaliações.</p>
                    </div>
                </div>

                {/* Area Selector Combobox - Fixed Styles */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-sm font-semibold text-slate-700 hidden md:block uppercase tracking-wider text-xs">Área:</span>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCombobox}
                                className="w-full md:w-[300px] justify-between bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                            >
                                {selectedArea ? (
                                    <span className="font-semibold">{selectedArea}</span>
                                ) : (
                                    <span className="text-slate-400">Selecione uma área...</span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 bg-white border-slate-200 shadow-lg">
                            <Command className="bg-white">
                                <CommandInput placeholder="Buscar área..." className="h-9" />
                                <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <CommandEmpty>Nenhuma área encontrada.</CommandEmpty>
                                    <CommandGroup>
                                        {areas.map((area) => (
                                            <CommandItem
                                                key={area}
                                                value={area}
                                                onSelect={() => {
                                                    setSelectedArea(area);
                                                    setOpenCombobox(false);
                                                }}
                                                className="cursor-pointer hover:bg-slate-100"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 text-blue-600",
                                                        selectedArea === area ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {area}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Empty State */}
            {!selectedArea && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                    <Search className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">Nenhuma área selecionada</h3>
                    <p className="text-slate-500 max-w-md text-center">
                        Para otimizar o desempenho, selecione uma área acima para carregar a lista de colaboradores e iniciar as avaliações.
                    </p>
                </div>
            )}

            {/* Grid */}
            {selectedArea && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmployees.map(employee => {
                        const evalData = evaluations[employee.id] || {};
                        const currentScore = calculateDailyScore(evalData);
                        const scoreStatus = getScoreColor(Number(currentScore));
                        const isSaved = savedStates[employee.id];

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                key={employee.id}
                            >
                                <Card className={`border-t-4 transition-all duration-300 shadow-sm ${isSaved
                                    ? 'border-t-green-500 ring-2 ring-green-100 bg-white'
                                    : 'border-t-blue-500 hover:shadow-lg bg-white'
                                    }`}>
                                    <CardHeader className="flex flex-row justify-between items-start pb-2">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <span className="text-slate-400 font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {employee.workerNumber ? `#${employee.workerNumber}` : 'N/A'}
                                                </span>
                                                <span className="truncate max-w-[180px]" title={employee.name}>{employee.name}</span>
                                            </CardTitle>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                    {employee.workstation || employee.jobTitle}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-full border-2 ${scoreStatus} shadow-sm`}>
                                            <span className="text-lg font-bold">{currentScore}</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 pt-0">
                                        {/* Quick KPI Visualization */}
                                        <div className="grid gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100 mt-2">
                                            {PILLARS.map(pillar => {
                                                const Icon = pillar.icon;
                                                const value = (evalData as any)[pillar.key] ?? 3;
                                                return (
                                                    <div key={pillar.key} className="space-y-1.5">
                                                        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Icon className={`w-3.5 h-3.5 ${pillar.color}`} />
                                                                {pillar.label}
                                                            </span>
                                                            <span className={cn(
                                                                "font-bold text-sm",
                                                                value < 2.5 ? "text-red-600" : value >= 3.5 ? "text-green-600" : "text-yellow-600"
                                                            )}>{value.toFixed(1)}</span>
                                                        </div>
                                                        <Slider
                                                            value={[value]}
                                                            max={4}
                                                            min={1}
                                                            step={0.5}
                                                            onValueChange={(val) => handleScoreChange(employee.id, pillar.key, val[0])}
                                                            className="py-1 cursor-pointer"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="pt-2">
                                            <Textarea
                                                placeholder="Observações do supervisor..."
                                                className="h-20 text-sm resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                                                value={evalData.notes || ""}
                                                onChange={(e) => handleNoteChange(employee.id, e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            className={cn(
                                                "w-full font-semibold shadow-sm transition-all duration-200",
                                                isSaved
                                                    ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                                                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
                                            )}
                                            onClick={() => submitEvaluation(employee)}
                                        >
                                            {isSaved ? (
                                                <span className="flex items-center animate-in fade-in zoom-in duration-300">
                                                    <Check className="w-5 h-5 mr-2" />
                                                    Avaliação Salva
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Salvar Avaliação
                                                </span>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
