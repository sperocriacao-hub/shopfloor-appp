"use client";

import React from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, User, CalendarDays } from 'lucide-react';
import { LeanProject, LeanProjectStatus } from '@/types';
import { NewKaizenDialog } from './NewKaizenDialog';
import { KaizenDetailDialog } from './KaizenDetailDialog';

const columns: { id: LeanProjectStatus; title: string; color: string }[] = [
    { id: 'draft', title: 'Rascunho / Ideia', color: 'bg-slate-100 border-slate-200' },
    { id: 'active', title: 'Em Andamento', color: 'bg-blue-50 border-blue-200' },
    { id: 'monitoring', title: 'Monitoramento', color: 'bg-amber-50 border-amber-200' },
    { id: 'closed', title: 'Concluído', color: 'bg-green-50 border-green-200' }
];

export function KaizenBoard({ type = 'kaizen' }: { type?: 'kaizen' | 'a3' }) {
    const { leanProjects, updateLeanProject } = useShopfloorStore();
    const projects = leanProjects.filter(p => p.type === type);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('projectId', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: LeanProjectStatus) => {
        const id = e.dataTransfer.getData('projectId');
        if (id) {
            updateLeanProject(id, { status });
        }
    };

    return (
        <div className="flex h-[calc(100vh-200px)] gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <div
                    key={col.id}
                    className={`flex-shrink-0 w-80 flex flex-col rounded-lg border ${col.color} p-2`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="flex items-center justify-between mb-3 px-2">
                        <h3 className="font-semibold text-slate-700">{col.title}</h3>
                        <Badge variant="secondary" className="bg-white/50">
                            {projects.filter(k => k.status === col.id).length}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 px-1">
                        {projects.filter(k => k.status === col.id).map(project => (
                            <KaizenDetailDialog
                                key={project.id}
                                project={project}
                                trigger={
                                    <div
                                        className="cursor-move hover:shadow-md transition-shadow relative group"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, project.id)}
                                    >
                                        <Card>
                                            <CardContent className="p-3 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-sm line-clamp-2">{project.title}</h4>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {project.impact && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.impact.safety && <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-200 text-red-600">Safety</Badge>}
                                                        {project.impact.quality && <Badge variant="outline" className="text-[10px] px-1 py-0 border-blue-200 text-blue-600">Quality</Badge>}
                                                        {project.impact.cost && <Badge variant="outline" className="text-[10px] px-1 py-0 border-green-200 text-green-600">Cost</Badge>}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span className="truncate max-w-[80px]">{project.ownerName || 'Unassigned'}</span>
                                                    </div>
                                                    {project.dueDate && (
                                                        <div className="flex items-center gap-1">
                                                            <CalendarDays className="h-3 w-3" />
                                                            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                }
                            />
                        ))}

                        {col.id === 'draft' && (
                            <div className="pt-2">
                                <NewKaizenDialog />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
