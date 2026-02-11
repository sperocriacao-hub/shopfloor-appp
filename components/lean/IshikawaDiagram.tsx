"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Fish } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface IshikawaDiagramProps {
    data: Record<string, string[]>;
    onChange: (newData: Record<string, string[]>) => void;
    readOnly?: boolean;
}

const CATEGORIES = {
    machine: 'Máquina',
    method: 'Método',
    material: 'Material',
    manpower: 'Mão de Obra',
    measurement: 'Medição',
    environment: 'Meio Ambiente'
};

export function IshikawaDiagram({ data = {}, onChange, readOnly = false }: IshikawaDiagramProps) {
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [newCause, setNewCause] = useState("");

    const handleAddCause = (category: string) => {
        if (!newCause.trim()) return;
        const currentCauses = data[category] || [];
        onChange({
            ...data,
            [category]: [...currentCauses, newCause]
        });
        setNewCause("");
    };

    const handleRemoveCause = (category: string, index: number) => {
        if (readOnly) return;
        const currentCauses = data[category] || [];
        const newCauses = [...currentCauses];
        newCauses.splice(index, 1);
        onChange({
            ...data,
            [category]: newCauses
        });
    };

    // Helper to visualize the layout
    // Top: Machine, Method, Material
    // Bottom: Manpower, Measurement, Environment
    const topCategories = ['machine', 'method', 'material'];
    const bottomCategories = ['manpower', 'measurement', 'environment'];

    return (
        <div className="w-full bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto">
            <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Fish className="h-5 w-5 text-blue-500" /> Diagrama de Ishikawa (Causa e Efeito)
            </h3>

            <div className="relative min-w-[800px] py-4">
                {/* Main Bone (Spine) */}
                <div className="absolute top-1/2 left-0 w-[85%] h-1 bg-slate-800 rounded z-0 transform -translate-y-1/2" />

                {/* Effect (Head) */}
                <div className="absolute top-1/2 right-0 w-[15%] h-20 -translate-y-1/2 border-2 border-slate-800 rounded bg-slate-100 flex items-center justify-center p-2 text-center text-sm font-bold shadow-sm">
                    EFEITO / PROBLEMA
                </div>

                {/* Top Branches */}
                <div className="flex justify-between w-[80%] mb-12 relative z-10 px-4">
                    {topCategories.map(cat => (
                        <div key={cat} className="flex flex-col items-center w-1/3 group">
                            <div className="bg-blue-50 border border-blue-200 px-3 py-1 text-sm font-bold text-blue-800 rounded mb-2 w-full text-center">
                                {CATEGORIES[cat as keyof typeof CATEGORIES]}
                            </div>
                            {/* Branch Line */}
                            <div className="h-16 w-0.5 bg-slate-400 rotate-12 transform origin-bottom translate-y-2 mb-2" />

                            {/* Causes List */}
                            <div className="space-y-1 w-full relative">
                                {(data[cat] || []).map((cause, idx) => (
                                    <div key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex justify-between items-center group/item hover:border-red-200">
                                        <span>{cause}</span>
                                        {!readOnly && (
                                            <button onClick={() => handleRemoveCause(cat, idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100">
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!readOnly && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full h-6 text-xs text-slate-400 dashed border border-transparent hover:border-slate-300">
                                                <Plus className="h-3 w-3 mr-1" /> Adicionar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Adicionar Causa: {CATEGORIES[cat as keyof typeof CATEGORIES]}</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex gap-2 mt-4">
                                                <Input
                                                    value={newCause}
                                                    onChange={e => setNewCause(e.target.value)}
                                                    placeholder="Descreva a causa potencial..."
                                                />
                                                <Button onClick={() => { handleAddCause(cat); }}>Adicionar</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-10"></div> {/* Spacer for spine */}

                {/* Bottom Branches */}
                <div className="flex justify-between w-[80%] mt-8 relative z-10 px-4">
                    {bottomCategories.map(cat => (
                        <div key={cat} className="flex flex-col-reverse items-center w-1/3 group">
                            <div className="bg-blue-50 border border-blue-200 px-3 py-1 text-sm font-bold text-blue-800 rounded mt-2 w-full text-center">
                                {CATEGORIES[cat as keyof typeof CATEGORIES]}
                            </div>
                            {/* Branch Line */}
                            <div className="h-16 w-0.5 bg-slate-400 -rotate-12 transform origin-top -translate-y-2 mt-2" />

                            {/* Causes List */}
                            <div className="space-y-1 w-full flex flex-col-reverse">
                                {(data[cat] || []).map((cause, idx) => (
                                    <div key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex justify-between items-center group/item hover:border-red-200 mb-1">
                                        <span>{cause}</span>
                                        {!readOnly && (
                                            <button onClick={() => handleRemoveCause(cat, idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100">
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!readOnly && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full h-6 text-xs text-slate-400 dashed border border-transparent hover:border-slate-300 mb-1">
                                                <Plus className="h-3 w-3 mr-1" /> Adicionar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Adicionar Causa: {CATEGORIES[cat as keyof typeof CATEGORIES]}</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex gap-2 mt-4">
                                                <Input
                                                    value={newCause}
                                                    onChange={e => setNewCause(e.target.value)}
                                                    placeholder="Descreva a causa potencial..."
                                                />
                                                <Button onClick={() => { handleAddCause(cat); }}>Adicionar</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
