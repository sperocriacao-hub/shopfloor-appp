"use client";

import React, { useState } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { LeanAudit } from '@/types';
import { ClipboardCheck, CheckCircle2, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// 5S Question Bank
const QUESTIONS_5S = {
    sort: [
        "Apenas itens necessários estão na área?",
        "Ferramentas e materiais obsoletos foram removidos?",
        "Corredores e saídas estão desobstruídos?"
    ],
    set_in_order: [
        "Existe um lugar definido para cada coisa?",
        "Tudo está no seu devido lugar?",
        "Identificações e etiquetas estão visíveis?"
    ],
    shine: [
        "Pisos, paredes e superfícies estão limpos?",
        "Equipamentos estão livres de sujeira e óleo?",
        "Materiais de limpeza estão acessíveis?"
    ],
    standardize: [
        "Procedimentos (POPs) estão visíveis?",
        "Gestão visual (quadros) está atualizada?",
        "As regras de 5S são claras para todos?"
    ],
    sustain: [
        "As pessoas seguem padrões sem supervisão?",
        "Auditorias anteriores foram tratadas?",
        "O espírito de melhoria contínua é visível?"
    ]
};

const PILLARS = ['sort', 'set_in_order', 'shine', 'standardize', 'sustain'] as const;
const PILLAR_NAMES = {
    sort: '1S - Seiri (Utilização)',
    set_in_order: '2S - Seiton (Ordenação)',
    shine: '3S - Seiso (Limpeza)',
    standardize: '4S - Seiketsu (Padronização)',
    sustain: '5S - Shitsuke (Disciplina)'
};

export function AuditWizard() {
    const { addLeanAudit, currentUser } = useShopfloorStore();
    const [open, setOpen] = useState(false);

    // Wizard State
    const [step, setStep] = useState(0); // 0: Setup, 1-5: Pillars, 6: Summary
    const [area, setArea] = useState('');
    const [answers, setAnswers] = useState<Record<string, boolean>>({});

    const currentPillar = PILLARS[step - 1];

    const handleAnswer = (questionIdx: number, value: boolean) => {
        setAnswers(prev => ({
            ...prev,
            [`${currentPillar}_${questionIdx}`]: value
        }));
    };

    const calculateScore = () => {
        const totalQs = PILLARS.length * 3;
        const yesAnswers = Object.values(answers).filter(v => v).length;
        return Math.round((yesAnswers / totalQs) * 100);
    };

    const handleSave = () => {
        const score = calculateScore();
        const newAudit: LeanAudit = {
            id: uuidv4(),
            type: '5s',
            area,
            score,
            maxScore: 100,
            checklistData: answers,
            auditorName: currentUser?.name || 'Auditor',
            createdAt: new Date().toISOString(),
        };
        addLeanAudit(newAudit);
        setOpen(false);
        setStep(0);
        setAnswers({});
        setArea('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><ClipboardCheck className="mr-2 h-4 w-4" /> Nova Auditoria 5S</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {step === 0 ? "Nova Auditoria 5S" :
                            step <= 5 ? PILLAR_NAMES[currentPillar] :
                                "Resumo da Auditoria"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Progress Bar */}
                    {step > 0 && (
                        <Progress value={(step / 6) * 100} className="mb-6 h-2" />
                    )}

                    {/* Step 0: Setup */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Área Auditada</Label>
                                <Input
                                    value={area}
                                    onChange={e => setArea(e.target.value)}
                                    placeholder="Ex: Montagem, Corte, Armazém..."
                                />
                            </div>
                            <div className="bg-blue-50 p-4 rounded text-sm text-blue-700">
                                Esta auditoria guiará você pelos 5 sensos do Lean.
                                Responda honestamente para identificar oportunidades reais de melhoria.
                            </div>
                        </div>
                    )}

                    {/* Steps 1-5: Pillars */}
                    {step >= 1 && step <= 5 && (
                        <div className="space-y-6">
                            {QUESTIONS_5S[currentPillar].map((q, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b pb-4">
                                    <span className="text-base font-medium text-slate-700 w-2/3">{q}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={answers[`${currentPillar}_${idx}`] === false ? "destructive" : "outline"}
                                            onClick={() => handleAnswer(idx, false)}
                                            className="w-20"
                                        >
                                            Não
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={answers[`${currentPillar}_${idx}`] === true ? "default" : "outline"}
                                            onClick={() => handleAnswer(idx, true)}
                                            className={`w-20 ${answers[`${currentPillar}_${idx}`] === true ? "bg-green-600 hover:bg-green-700" : ""}`}
                                        >
                                            Sim
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 6: Summary */}
                    {step === 6 && (
                        <div className="text-center space-y-6">
                            <div className="text-5xl font-bold text-slate-800">{calculateScore()}%</div>
                            <p className="text-slate-500">Score Final do 5S</p>

                            <div className="grid grid-cols-5 gap-2 text-xs">
                                {PILLARS.map(p => {
                                    const pillarScore = [0, 1, 2].filter(i => answers[`${p}_${i}`]).length;
                                    return (
                                        <div key={p} className="bg-slate-50 p-2 rounded">
                                            <div className="font-bold uppercase mb-1">{p.replace(/_/g, ' ')}</div>
                                            <div className={pillarScore === 3 ? "text-green-600" : "text-amber-600"}>
                                                {pillarScore}/3
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-amber-50 p-4 rounded border border-amber-200 text-left">
                                <h4 className="font-bold text-amber-800 text-sm mb-2">Próximos Passos</h4>
                                <ul className="list-disc list-inside text-sm text-amber-700">
                                    <li>Revise os itens marcados como "Não".</li>
                                    <li>Crie ações corretivas (Kaizen) para as falhas encontradas.</li>
                                    <li>Compartilhe este resultado com a equipe da área.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-4">
                    {step > 0 ? (
                        <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 6 ? (
                        <Button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 0 && !area}
                        >
                            Próximo <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                            Finalizar Auditoria
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
