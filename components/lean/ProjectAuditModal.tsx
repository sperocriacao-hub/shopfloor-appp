"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { LeanProject } from '@/types';
import { ShieldCheck, Award, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectAuditDialogProps {
    project: LeanProject;
}

const AUDIT_CRITERIA = [
    { id: 'define', label: '1. Definição do Problema (Claro e específico?)' },
    { id: 'measure', label: '2. Medição (Dados confiáveis e Target definido?)' },
    { id: 'analyze', label: '3. Análise (Causa Raiz confirmada com 5 Porquês?)' },
    { id: 'improve', label: '4. Melhoria (Ações atacam a Causa Raiz?)' },
    { id: 'control', label: '5. Controle (Resultados sustentados e padronizados?)' }
];

export function ProjectAuditModal({ project }: ProjectAuditDialogProps) {
    const { updateLeanProject } = useShopfloorStore();
    const [open, setOpen] = useState(false);

    // Load existing data or init
    const existingData = project.certificationData || {};
    const [scores, setScores] = useState<Record<string, number>>(existingData.scores || {});
    const [feedback, setFeedback] = useState(existingData.feedback || '');

    const handleScoreChange = (id: string, val: number) => {
        setScores(prev => ({ ...prev, [id]: val }));
    };

    const calculateTotal = () => {
        let total = 0;
        AUDIT_CRITERIA.forEach(c => {
            total += (scores[c.id] || 0);
        });
        // Max score is 5 criteria * 2 points (0, 1, 2) = 10 points
        return (total / 10) * 100;
    };

    const handleSave = async () => {
        const finalScore = calculateTotal();
        const status = finalScore >= 80 ? 'certified' : 'rejected';

        await updateLeanProject(project.id, {
            certificationStatus: status,
            certificationScore: finalScore,
            certificationData: { scores, feedback }
        });

        toast.success(`Auditoria salva! Status: ${status === 'certified' ? 'APROVADO' : 'REPROVADO'}`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800">
                    <ShieldCheck className="h-4 w-4" />
                    {project.certificationStatus === 'certified' ? 'Certificado Black Belt' : 'Auditoria Black Belt (V18)'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        Auditoria de Certificação Black Belt
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 mb-4">
                        Avalie cada etapa do projeto (0 = Ruim, 1 = Regular, 2 = Bom).
                        Necessário 80% para certificação.
                    </div>

                    {AUDIT_CRITERIA.map(criterion => (
                        <div key={criterion.id} className="flex items-center justify-between border-b pb-2">
                            <Label className="w-2/3 text-xs">{criterion.label}</Label>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => handleScoreChange(criterion.id, val)}
                                        className={`
                                            w-8 h-8 rounded-full text-xs font-bold border transition-colors
                                            ${scores[criterion.id] === val
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                                        `}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">Score Final</span>
                            <span className={`text-xl font-bold ${calculateTotal() >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateTotal()}%
                            </span>
                        </div>
                        <Label>Feedback do Master Black Belt</Label>
                        <Textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Pontos fortes e oportunidades de melhoria..."
                            className="mt-1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">
                        Salvar Auditoria
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
