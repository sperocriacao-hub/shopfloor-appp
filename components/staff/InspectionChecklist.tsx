"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MinusCircle, Save, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { SafetyInspection } from "@/types";

const CHECKLIST_ITEMS = [
    { id: 'ppe', label: 'Uso correto de EPIs na secção' },
    { id: 'pathways', label: 'Caminhos desobstruídos e marcados' },
    { id: 'machinery', label: 'Proteções de máquinas funcionais' },
    { id: 'fire', label: 'Extintores acessíveis e visíveis' },
    { id: 'chemicals', label: 'Produtos químicos armazenados corretamente' },
    { id: 'electrical', label: 'Quadros elétricos fechados' },
    { id: 'cleanliness', label: 'Limpeza e Organização (5S)' },
];

export function InspectionChecklist() {
    const { addInspection, currentUser, employees } = useShopfloorStore();
    const [area, setArea] = useState("");
    const [checklistData, setChecklistData] = useState<Record<string, 'pass' | 'fail' | 'na'>>({});
    const [notes, setNotes] = useState("");

    // Get areas from employees
    const areas = Array.from(new Set(employees.map(e => e.area).filter(Boolean))).sort();

    const handleCheck = (itemId: string, status: 'pass' | 'fail' | 'na') => {
        setChecklistData(prev => ({ ...prev, [itemId]: status }));
    };

    const calculateScore = () => {
        const items = Object.values(checklistData).filter(v => v !== 'na');
        if (items.length === 0) return 0;
        const passCount = items.filter(v => v === 'pass').length;
        return (passCount / items.length) * 100;
    };

    const handleSave = () => {
        if (!area) {
            toast.error("Selecione uma área.");
            return;
        }
        if (Object.keys(checklistData).length === 0) {
            toast.error("Preencha pelo menos um item.");
            return;
        }

        const score = calculateScore();

        const newInspection: SafetyInspection = {
            id: `insp-${Date.now()}`,
            date: new Date().toISOString(),
            area,
            inspectorId: currentUser?.id,
            overallScore: score,
            checklistData,
            createdAt: new Date().toISOString()
        };

        addInspection(newInspection);
        toast.success(`Inspeção salva! Score: ${score.toFixed(0)}%`);

        // Reset
        setChecklistData({});
        setNotes("");
        setArea("");
    };

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    Checklist Diário de Segurança
                </CardTitle>
                <CardDescription>Realize a inspeção diária por área.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label>Área Inspecionada</Label>
                        <Select value={area} onValueChange={setArea}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a área..." />
                            </SelectTrigger>
                            <SelectContent>
                                {areas.map(a => (
                                    <SelectItem key={a} value={a}>{a}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label>Data</Label>
                        <div className="p-2 border rounded bg-slate-50 text-sm">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <div className="space-y-2 border rounded-md divide-y">
                    {CHECKLIST_ITEMS.map(item => {
                        const status = checklistData[item.id];
                        return (
                            <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={status === 'pass' ? 'default' : 'outline'}
                                        className={status === 'pass' ? 'bg-green-600 hover:bg-green-700' : 'text-slate-500'}
                                        onClick={() => handleCheck(item.id, 'pass')}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" /> OK
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={status === 'fail' ? 'destructive' : 'outline'}
                                        className={status === 'fail' ? '' : 'text-slate-500'}
                                        onClick={() => handleCheck(item.id, 'fail')}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" /> NOK
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={status === 'na' ? 'secondary' : 'ghost'}
                                        className="text-slate-500"
                                        onClick={() => handleCheck(item.id, 'na')}
                                    >
                                        <MinusCircle className="w-4 h-4 mr-1" /> N/A
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-2">
                    <Label>Observações Adicionais</Label>
                    <Textarea
                        placeholder="Detalhes sobre falhas ou melhorias..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                </div>

                <div className="pt-4 flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-500">
                        Score Calculado: <span className="font-bold text-slate-900 text-lg">{calculateScore().toFixed(0)}%</span>
                    </div>
                    <Button onClick={handleSave} disabled={!area}>
                        <Save className="w-4 h-4 mr-2" /> Salvar Inspeção
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
