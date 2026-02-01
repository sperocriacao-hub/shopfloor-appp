"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { HardHat, Shield, Activity, TrendingUp, CheckCircle, AlertTriangle, Save } from "lucide-react";
import { motion } from "framer-motion";
import { DailyEvaluation, Employee } from "@/types";

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
    const { employees, currentUser, addEvaluation } = useShopfloorStore();
    const [selectedArea, setSelectedArea] = useState<string>("All");

    // Evaluation State: { [employeeId]: Partial<DailyEvaluation> }
    const [evaluations, setEvaluations] = useState<Record<string, Partial<DailyEvaluation>>>({});

    // Filter employees present (active)
    const activeEmployees = employees.filter(e => e.hrStatus === 'active');

    // Unique Areas
    const areas = ["All", ...Array.from(new Set(employees.map(e => e.area).filter(Boolean)))];

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
    };

    const handleNoteChange = (employeeId: string, note: string) => {
        setEvaluations(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                notes: note
            }
        }));
    };

    const calculateDailyScore = (evalData: Partial<DailyEvaluation> | undefined) => {
        if (!evalData) return 0;
        const scores = PILLARS.map(p => (evalData as any)[p.key] || 0);
        const sum = scores.reduce((a, b) => a + b, 0);
        // Only count pillars that have been rated (simple average logic, or strictly divide by 7)
        // For simplicity, we assume default 0 means not rated yet? Or we init with default values.
        // Let's assume supervisor sets all.
        return (sum / 7).toFixed(1);
    };

    const getScoreColor = (score: number) => {
        if (score >= 3.5) return "bg-green-100 text-green-700 border-green-300";
        if (score >= 2.5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
        return "bg-red-100 text-red-700 border-red-300";
    };

    const submitEvaluation = (employee: Employee) => {
        const evalData = evaluations[employee.id];

        // Validation: Must fill all fields? Or at least some.
        // For MVP, just ensure object exists
        if (!evalData) return;

        // Construct full object
        const newEval: DailyEvaluation = {
            id: `eval-${Date.now()}-${employee.id}`,
            employeeId: employee.id,
            supervisorId: currentUser?.id,
            date: new Date().toISOString().split('T')[0],
            hstScore: evalData.hstScore || 3, // Default average
            epiScore: evalData.epiScore || 3,
            postCleaningScore: evalData.postCleaningScore || 3,
            qualityScore: evalData.qualityScore || 3,
            efficiencyScore: evalData.efficiencyScore || 3,
            objectivesScore: evalData.objectivesScore || 3,
            attitudeScore: evalData.attitudeScore || 3,
            notes: evalData.notes || "",
            createdAt: new Date().toISOString()
        };

        addEvaluation(newEval);
        toast.success(`Avaliação de ${employee.name} salva com sucesso!`);

        // Remove from local state (reset UI for that card) or mark as done
        // setEvaluations(prev => { const n = {...prev}; delete n[employee.id]; return n; });
    };

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-32">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Avaliação Diária de Desempenho</h1>
                    <p className="text-slate-500">Supervisão de Equipa • {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    {areas.map(area => (
                        <Button
                            key={area}
                            variant={selectedArea === area ? "default" : "outline"}
                            onClick={() => setSelectedArea(area)}
                            className={selectedArea === area ? "bg-blue-600" : ""}
                        >
                            {area}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(employee => {
                    const evalData = evaluations[employee.id] || {};
                    const currentScore = calculateDailyScore(evalData);
                    const scoreStatus = getScoreColor(Number(currentScore));

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={employee.id}
                        >
                            <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row justify-between items-start pb-2">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800">
                                            {employee.name}
                                        </CardTitle>
                                        <Badge variant="secondary" className="mt-1">
                                            {employee.workstation || employee.jobTitle}
                                        </Badge>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 ${scoreStatus} shadow-sm`}>
                                        <span className="text-xl font-bold">{currentScore === "0.0" ? "-" : currentScore}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-2">
                                    <div className="grid gap-4">
                                        {PILLARS.map(pillar => {
                                            const Icon = pillar.icon;
                                            const value = (evalData as any)[pillar.key] || 3; // Default visual start at 3 (Good)

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
                                            className="h-20 text-sm resize-none"
                                            value={evalData.notes || ""}
                                            onChange={(e) => handleNoteChange(employee.id, e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-slate-900 hover:bg-slate-800"
                                        onClick={() => submitEvaluation(employee)}
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
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
