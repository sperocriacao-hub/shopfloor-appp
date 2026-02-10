"use client";

import React, { useState } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LeanProject } from '@/types';
import { Lightbulb, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function NewKaizenDialog() {
    const { addLeanProject, currentUser } = useShopfloorStore();
    const [open, setOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'kaizen' | 'a3'>('kaizen');

    // Impact State
    const [impact, setImpact] = useState({
        safety: false,
        quality: false,
        cost: false,
        delivery: false
    });

    const handleSave = () => {
        if (!title) return; // Simple validation

        const newProject: LeanProject = {
            id: uuidv4(),
            title,
            description,
            type,
            status: 'draft',
            ownerName: currentUser?.name || 'Solicitante',
            startDate: new Date().toISOString(),
            impact, // Store the impact flags
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            actions: []
        };

        addLeanProject(newProject);
        setOpen(false);

        // Reset form
        setTitle('');
        setDescription('');
        setImpact({ safety: false, quality: false, cost: false, delivery: false });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Lightbulb className="mr-2 h-4 w-4" /> Nova Ideia / Kaizen</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Melhoria (Kaizen)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Título da Ideia</Label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Reduzir desperdício na linha 2..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Projeto</Label>
                        <Select value={type} onValueChange={(v: 'kaizen' | 'a3') => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kaizen">Kaizen (Melhoria Rápida)</SelectItem>
                                <SelectItem value="a3">A3 (Resolução Problema Complexo)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição da Situação Atual / Proposta</Label>
                        <Textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva o problema e a sugestão..."
                            className="h-24"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Impacto Esperado (KPIs)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                <Checkbox
                                    id="safety"
                                    checked={impact.safety}
                                    onCheckedChange={(c) => setImpact(prev => ({ ...prev, safety: !!c }))}
                                />
                                <Label htmlFor="safety" className="cursor-pointer">Segurança</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                <Checkbox
                                    id="quality"
                                    checked={impact.quality}
                                    onCheckedChange={(c) => setImpact(prev => ({ ...prev, quality: !!c }))}
                                />
                                <Label htmlFor="quality" className="cursor-pointer">Qualidade</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                <Checkbox
                                    id="cost"
                                    checked={impact.cost}
                                    onCheckedChange={(c) => setImpact(prev => ({ ...prev, cost: !!c }))}
                                />
                                <Label htmlFor="cost" className="cursor-pointer">Custo</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                <Checkbox
                                    id="delivery"
                                    checked={impact.delivery}
                                    onCheckedChange={(c) => setImpact(prev => ({ ...prev, delivery: !!c }))}
                                />
                                <Label htmlFor="delivery" className="cursor-pointer">Entrega/Prazo</Label>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                        Registrar Kaizen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
