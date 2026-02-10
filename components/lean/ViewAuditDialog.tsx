"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LeanAudit } from '@/types';
import { Eye } from 'lucide-react';

interface ViewAuditDialogProps {
    audit: LeanAudit;
}

export function ViewAuditDialog({ audit }: ViewAuditDialogProps) {
    const PILLARS = ['sort', 'set_in_order', 'shine', 'standardize', 'sustain'];

    // Helper to count "Yes" answers per pillar
    const getPillarScore = (pillar: string) => {
        if (!audit.checklistData) return 0;
        return [0, 1, 2].filter(i => audit.checklistData[`${pillar}_${i}`]).length;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalhes da Auditoria 5S</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-slate-500">Área</p>
                            <p className="font-semibold">{audit.area}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Data</p>
                            <p className="font-semibold">{new Date(audit.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Auditor</p>
                            <p className="font-medium">{audit.auditorName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Score Final</p>
                            <p className="font-bold text-xl text-blue-600">{audit.score}/{audit.maxScore}</p>
                        </div>
                    </div>

                    {/* Breakdown by Pillar */}
                    <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">Detalhamento por Senso</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PILLARS.map(pillar => {
                                const score = getPillarScore(pillar);
                                return (
                                    <div key={pillar} className="border p-3 rounded hover:bg-slate-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium uppercase text-sm">{pillar.replace(/_/g, ' ')}</span>
                                            <span className={`text-sm font-bold ${score === 3 ? 'text-green-600' : 'text-amber-600'}`}>
                                                {score}/3
                                            </span>
                                        </div>
                                        {/* Show failed items if any */}
                                        {score < 3 && (
                                            <div className="text-xs text-red-500">
                                                {/* In a real app we'd show the specific failed question text. 
                                                    For now we show a generic alert since we don't have the question map here yet. */}
                                                Falhas detectadas. Requer Kaizen.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    {audit.notes && (
                        <div className="bg-amber-50 p-4 rounded border border-amber-200">
                            <h4 className="font-bold text-amber-800 text-sm mb-1">Notas / Observações</h4>
                            <p className="text-sm text-amber-900">{audit.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
