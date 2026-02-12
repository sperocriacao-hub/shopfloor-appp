"use client";

import React, { useState, useEffect } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { LeanAction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface ActionPlanEditorProps {
    projectId: string;
}

export function ActionPlanEditor({ projectId }: ActionPlanEditorProps) {
    const { leanActions, addLeanAction, updateLeanAction } = useShopfloorStore();

    // We need to filter global actions by projectId
    // In V15 schema: LeanAction has projectId field.
    const projectActions = leanActions.filter(a => a.projectId === projectId);

    const [newDesc, setNewDesc] = useState('');
    const [newResponsible, setNewResponsible] = useState('');
    const [newDueDate, setNewDueDate] = useState('');

    const handleAdd = async () => {
        if (!newDesc || !newResponsible) {
            toast.error("Preencha descrição e responsável");
            return;
        }

        const newAction: LeanAction = {
            id: uuidv4(),
            projectId: projectId,
            description: newDesc,
            responsibleName: newResponsible,
            dueDate: newDueDate,
            status: 'pending',
            priority: 'medium'
        };

        await addLeanAction(newAction);
        setNewDesc('');
        setNewResponsible('');
        setNewDueDate('');
        toast.success("Ação adicionada!");
    };

    const handleToggleStatus = async (action: LeanAction) => {
        const newStatus = action.status === 'completed' ? 'pending' : 'completed';
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;
        await updateLeanAction(action.id, { status: newStatus, completedAt });
    };

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">O Quê (Ação)</TableHead>
                            <TableHead>Quem</TableHead>
                            <TableHead>Quando</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectActions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-xs text-slate-400 py-4">
                                    Nenhuma ação planejada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            projectActions.map(action => (
                                <TableRow key={action.id} className="text-xs">
                                    <TableCell>{action.description}</TableCell>
                                    <TableCell>{action.responsibleName}</TableCell>
                                    <TableCell>{action.dueDate ? new Date(action.dueDate).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={action.status === 'completed' ? 'default' : 'outline'} className={action.status === 'completed' ? 'bg-green-600' : ''}>
                                            {action.status === 'completed' ? 'Concluído' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(action)}>
                                            {action.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-slate-400" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add New */}
            <div className="grid grid-cols-7 gap-2 items-end bg-blue-50 p-2 rounded border border-blue-100 print:hidden">
                <div className="col-span-3">
                    <Input placeholder="Nova ação..." className="h-8 text-xs bg-white" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                </div>
                <div className="col-span-2">
                    <Input placeholder="Responsável" className="h-8 text-xs bg-white" value={newResponsible} onChange={e => setNewResponsible(e.target.value)} />
                </div>
                <div>
                    <Input type="date" className="h-8 text-xs bg-white" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
                </div>
                <div>
                    <Button size="sm" className="h-8 w-full bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
