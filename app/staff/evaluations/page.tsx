"use client";

import { useState, useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { HardHat, Shield, Activity, TrendingUp, CheckCircle, AlertTriangle, Save, Check, ChevronsUpDown, Search } from "lucide-react";
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
    const [selectedArea, setSelectedArea] = useState<string>("All");
    const [openCombobox, setOpenCombobox] = useState(false);

    // Evaluation State: { [employeeId]: Partial<DailyEvaluation> }
    const [evaluations, setEvaluations] = useState<Record<string, Partial<DailyEvaluation>>>({});

    // Track saved state for visual feedback: { [employeeId]: boolean }
    const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});

    // Load existing evaluations for today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const todaysEvals = dailyEvaluations.filter(e => e.date === today);

        if (todaysEvals.length > 0) {
            const initialState: Record<string, Partial<DailyEvaluation>> = {};
            todaysEvals.forEach(e => {
                initialState[e.employeeId] = { ...e };
            });
            setEvaluations(prev => ({ ...prev, ...initialState }));

            // Mark loaded ones as "saved" initially? No, user might want to edit.
            // But if they match DB, they are technically saved.
            // Let's just leave savedState false until they click save again to confirm changes.
        }
    }, [dailyEvaluations]);

    // Filter employees present (active)
    const activeEmployees = employees.filter(e => e.hrStatus === 'active');

    // Unique Areas
    const areas = ["All", ...Array.from(new Set(employees.map(e => e.area).filter(Boolean))).sort()];

    const filteredEmployees = selectedArea === "All"
        ? activeEmployees
        : activeEmployees.filter(e => e.area === selectedArea);

    const handleScoreChange = (employeeId: string, pillarKey: string, value: number) => {
        setEvaluations(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [pillarKey]: value
            }
        }));
        // Reset saved state on change
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

        // Construct full object
        const newEval: DailyEvaluation = {
            id: evalData?.id || `eval-${Date.now()}-${employee.id}`, // Reuse ID if exists (update)
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
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Avaliação Diária</h1>
                    <p className="text-slate-500">Supervisão • {new Date().toLocaleDateString()}</p>
                </div>

                {/* Area Selector Combobox */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-600 hidden md:block">Filtrar por Área:</span>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCombobox}
                                className="w-full md:w-[250px] justify-between"
                            >
                                {selectedArea === "All" ? "Todas as Áreas" : selectedArea}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar área..." />
                                <CommandList>
                                    <CommandEmpty>Nenhuma área encontrada.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            value="All"
                                            onSelect={() => {
                                                setSelectedArea("All");
                                                setOpenCombobox(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedArea === "All" ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            Todas as Áreas
                                        </CommandItem>
                                        {areas.filter(a => a !== "All").map((area) => (
                                            <CommandItem
                                                key={area}
                                                value={area}
                                                onSelect={(currentValue) => {
                                                    setSelectedArea(area); // Use exact area name from list
                                                    setOpenCombobox(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(employee => {
                    const evalData = evaluations[employee.id] || {};
                    // If no data, use 3 defaults for calc to match UI slider default
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
                            <Card className={`border-t-4 transition-all duration-300 ${isSaved ? 'border-t-green-500 shadow-md ring-1 ring-green-100' : 'border-t-blue-500 hover:shadow-lg'}`}>
                                <CardHeader className="flex flex-row justify-between items-start pb-2">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <span className="text-slate-400 font-mono text-sm">#{employee.workerNumber || 'N/A'}</span>
                                            {employee.name}
                                        </CardTitle>
                                        <Badge variant="secondary" className="mt-1">
                                            {employee.workstation || employee.jobTitle}
                                        </Badge>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 ${scoreStatus} shadow-sm transition-colors duration-500`}>
                                        <span className="text-xl font-bold">{currentScore}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-2">
                                    <div className="grid gap-4">
                                        {PILLARS.map(pillar => {
                                            const Icon = pillar.icon;
                                            const value = (evalData as any)[pillar.key] ?? 3; // Default 3

                                            return (
                                                <div key={pillar.key} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-medium text-slate-600">
                                                        <span className="flex items-center gap-1">
                                                            <Icon className={`w-3 h-3 ${pillar.color}`} /> {pillar.label}
                                                        </span>
                                                        <span className={
                                                            value < 2.5 ? "text-red-600" : value >= 3.5 ? "text-green-600" : "text-yellow-600"
                                                        }>{value.toFixed(1)}</span>
                                                    </div>
                                                    <Slider
                                                        value={[value]}
                                                        max={4}
                                                        min={1}
                                                        step={0.5}
                                                        onValueChange={(val) => handleScoreChange(employee.id, pillar.key, val[0])}
                                                        className="py-1"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-2 border-t">
                                        <Textarea
                                            placeholder="Observação rápida (opcional)..."
                                            className="h-20 text-sm resize-none focus:ring-blue-200 transaction-all"
                                            value={evalData.notes || ""}
                                            onChange={(e) => handleNoteChange(employee.id, e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className={cn(
                                            "w-full transition-all duration-300",
                                            isSaved
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : "bg-slate-900 hover:bg-slate-800 text-white"
                                        )}
                                        onClick={() => submitEvaluation(employee)}
                                    >
                                        {isSaved ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" /> Salvo!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
