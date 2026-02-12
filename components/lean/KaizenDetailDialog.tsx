"use client";

import React, { useState } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeanProject, LeanProjectStatus } from '@/types';
import { MoreHorizontal, Edit2, CheckCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ActionPlanEditor } from './ActionPlanEditor';

interface KaizenDetailDialogProps {
    project: LeanProject;
    trigger?: React.ReactNode;
}

export function KaizenDetailDialog({ project, trigger }: KaizenDetailDialogProps) {
    const { updateLeanProject } = useShopfloorStore();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<LeanProjectStatus>(project.status);
    const [notes, setNotes] = useState(project.rootCauseAnalysis || '');

    const handleSave = () => {
        updateLeanProject(project.id, {
            status,
            rootCauseAnalysis: notes,
            updatedAt: new Date().toISOString()
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {project.type === 'kaizen' ? '🛠 Detalhes do Kaizen' : '🎯 Projeto A3'}
                        <Badge variant="outline">{project.status}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Título</Label>
                        <p className="font-semibold text-lg">{project.title}</p>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Descrição / Problema</Label>
                        <div className="bg-slate-50 p-3 rounded-md text-sm">
                            {project.description || "Sem descrição."}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Responsável</Label>
                            <p className="text-sm font-medium">{project.ownerName}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Data Criação</Label>
                            <p className="text-sm font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <Label>Atualizar Status</Label>
                        <Select value={status} onValueChange={(v: LeanProjectStatus) => setStatus(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Rascunho</SelectItem>
                                <SelectItem value="active">Em Andamento</SelectItem>
                                <SelectItem value="monitoring">Monitoramento</SelectItem>
                                <SelectItem value="closed">Concluído</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Economia Est. (Ano)</Label>
                        <div className="col-span-3">
                            <Input
                                type="number"
                                value={savings}
                                onChange={(e) => setSavings(e.target.value)}
                                placeholder="Valor em €"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Análise / Notas de Progresso</Label>
                        <Textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Adicione notas sobre a resolução ou análise de causa raiz..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <Label className="mb-2 block font-semibold text-slate-700">Plano de Ação</Label>
                        <ActionPlanEditor projectId={project.id} />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Salvar Alterações
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
