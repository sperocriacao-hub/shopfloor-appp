"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { LeanAuditList } from '@/components/lean/LeanAuditList';
import { KaizenBoard } from '@/components/lean/KaizenBoard';
import { ActionTracker } from '@/components/lean/ActionTracker';
import { A3Editor } from '@/components/lean/A3Editor';
import { LeanProject } from '@/types';
import { NewKaizenDialog } from '@/components/lean/NewKaizenDialog';
import { Button } from '@/components/ui/button';
import { Badge as UiBadge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { AuditWizard } from '@/components/lean/AuditWizard';

export default function LeanPage() {
    const { leanAudits, leanProjects } = useShopfloorStore();
    const [editingA3, setEditingA3] = useState<LeanProject | null>(null);

    // If editing an A3, show the full screen editor
    if (editingA3) {
        return <A3Editor project={editingA3} onClose={() => setEditingA3(null)} />;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Lean Manufacturing & Melhoria Contínua</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Auditorias Realizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leanAudits.length}</div>
                        <p className="text-xs text-slate-400">Últimos 30 dias</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Projetos Kaizen (Ativos)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {leanProjects.filter(p => p.type === 'kaizen' && p.status === 'active').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">A3 Problem Solving</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {leanProjects.filter(p => p.type === 'a3').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Score Médio 5S</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {leanAudits.length > 0
                                ? Math.round(leanAudits.reduce((acc, curr) => acc + curr.score, 0) / leanAudits.length) + '%'
                                : '-'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="audits">Auditorias 5S</TabsTrigger>
                    <TabsTrigger value="kaizen">Quadro Kaizen</TabsTrigger>
                    <TabsTrigger value="a3">Projetos A3</TabsTrigger>
                    <TabsTrigger value="actions">Action Tracker</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumo de Atividades</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded border border-dashed text-slate-400">
                                    Gráfico de Tendência (Em breve)
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audits">
                    <LeanAuditList />
                </TabsContent>

                <TabsContent value="kaizen">
                    <KaizenBoard type="kaizen" />
                </TabsContent>

                <TabsContent value="a3">
                    <div className="relative">
                        <div onClickCapture={(e) => {
                            // Global intercept to check if we clicked an A3 card? A bit hacky but works for now to hijack the generic card click
                            // Ideally we refactor proper props
                        }}>
                            <KaizenBoardWrapper type="a3" onEdit={setEditingA3} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="actions">
                    <ActionTracker />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Wrapper for A3 Board specific behavior
function KaizenBoardWrapper({ type, onEdit }: { type: 'a3', onEdit: (p: LeanProject) => void }) {
    const { leanProjects } = useShopfloorStore();
    const projects = leanProjects.filter(p => p.type === type);
    const columns = [
        { id: 'draft', title: 'Definição', color: 'bg-slate-100' },
        { id: 'active', title: 'Análise & Plano', color: 'bg-blue-50' },
        { id: 'monitoring', title: 'Implementação', color: 'bg-amber-50' },
        { id: 'closed', title: 'Concluído', color: 'bg-green-50' }
    ];

    return (
        <div className="flex h-[calc(100vh-250px)] gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className={`flex-shrink-0 w-80 flex flex-col rounded-lg border ${col.color} p-2`}>
                    <h3 className="font-semibold text-slate-700 mb-2 px-2 flex justify-between">
                        {col.title}
                        <UiBadge variant="secondary">{projects.filter(p => p.status === col.id).length}</UiBadge>
                    </h3>
                    <div className="space-y-2 overflow-y-auto flex-1">
                        {projects.filter(p => p.status === col.id).map(p => (
                            <Card key={p.id} className="cursor-pointer hover:shadow-md" onClick={() => onEdit(p)}>
                                <CardContent className="p-3">
                                    <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{p.background || 'Sem contexto.'}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <UiBadge variant="outline" className="text-[10px]">{p.ownerName}</UiBadge>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {col.id === 'draft' && <div className="pt-2"><NewKaizenDialog defaultType="a3" /></div>}
                    </div>
                </div>
            ))}
        </div>
    )
}
