"use client";

import React, { useState } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeanAudit, LeanAuditType } from '@/types';
import { ClipboardCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function NewAuditDialog() {
    const { addLeanAudit } = useShopfloorStore();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<LeanAuditType>('5s');
    const [area, setArea] = useState('');
    const [score, setScore] = useState(0);

    const handleSave = () => {
        const newAudit: LeanAudit = {
            id: uuidv4(),
            type,
            area,
            score,
            maxScore: 100, // Concept
            checklistData: {},
            createdAt: new Date().toISOString(),
        };
        addLeanAudit(newAudit);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><ClipboardCheck className="mr-2 h-4 w-4" /> New Audit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Auditoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Auditoria</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5s">5S</SelectItem>
                                <SelectItem value="gemba">Gemba Walk</SelectItem>
                                <SelectItem value="safety">Segurança</SelectItem>
                                <SelectItem value="process">Processo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Área</Label>
                        <Input value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: Montagem Final" />
                    </div>
                    <div className="space-y-2">
                        <Label>Score (Simulação)</Label>
                        <Input type="number" value={score} onChange={e => setScore(Number(e.target.value))} />
                    </div>
                    <Button onClick={handleSave} className="w-full">Iniciar Auditoria</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
