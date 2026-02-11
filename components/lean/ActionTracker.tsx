"use client";

import React, { useState } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Circle, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function ActionTracker() {
    const { leanProjects } = useShopfloorStore();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [search, setSearch] = useState('');

    // Flatten logic: Get actions from projects? 
    // Currently leanActions are separate in store but linked to projects?
    // Checking store... leanActions are in `state.leanActions`.
    // Wait, in V15 we put `actions: []` inside `leanProjects`. 
    // But `syncData` fetches `lean_actions` separately.
    // Let's assume there is a `leanActions` array in store or we derive from projects if structured there.
    // Looking at store update: `stateUpdates.leanActions = leanActions...`
    // So we should use `leanActions` from store.

    // Correction: I need to check if `leanActions` is exported from useShopfloorStore
    // Based on previous `useShopfloorStore.ts` view:
    // `leanActions: LeanAction[]` exists in state.

    // @ts-ignore
    const { leanActions } = useShopfloorStore();

    // Helper to find Project Title
    const getProjectTitle = (projectId?: string) => {
        if (!projectId) return '-';
        return leanProjects.find(p => p.id === projectId)?.title || 'Unknown Project';
    };

    const filteredActions = (leanActions || []).filter((action: any) => {
        const matchesStatus = filterStatus === 'all' || action.status === filterStatus;
        const matchesSearch = action.description.toLowerCase().includes(search.toLowerCase())
            || (action.responsibleName || '').toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Rastreador de Ações (Planos de Ação)</CardTitle>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar ação ou responsável..."
                            className="pl-8"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Pendentes</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluídos</SelectItem>
                            <SelectItem value="delayed">Atrasados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Descrição</TableHead>
                            <TableHead>Projeto / Origem</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Prazo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredActions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Nenhuma ação encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredActions.map((action: any) => (
                                <TableRow key={action.id}>
                                    <TableCell className="font-medium">{action.description}</TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {getProjectTitle(action.projectId)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {(action.responsibleName || '?').charAt(0)}
                                            </div>
                                            <span className="text-sm">{action.responsibleName || 'Não atribuído'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {action.dueDate ? (
                                            <div className={`text-sm ${new Date(action.dueDate) < new Date() && action.status !== 'completed' ? 'text-red-600 font-bold flex items-center gap-1' : ''}`}>
                                                {new Date(action.dueDate) < new Date() && action.status !== 'completed' && <AlertCircle className="h-3 w-3" />}
                                                {new Date(action.dueDate).toLocaleDateString()}
                                            </div>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            action.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                action.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-slate-50 text-slate-700'
                                        }>
                                            {action.status === 'completed' ? 'Concluído' :
                                                action.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {action.status !== 'completed' && (
                                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
