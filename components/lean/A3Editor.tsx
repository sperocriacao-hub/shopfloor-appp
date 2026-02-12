"use client";

import React, { useState, useEffect } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { LeanProject, LeanProjectStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Printer, ArrowLeft } from 'lucide-react';
import { IshikawaDiagram } from './IshikawaDiagram';
import { FiveWhysInput } from './FiveWhysInput';
import { TrendChartEditor } from './TrendChartEditor';
import { ActionPlanEditor } from './ActionPlanEditor'; // We will create this next
import { toast } from 'sonner';

interface A3EditorProps {
    project: LeanProject;
    onClose: () => void;
}

export function A3Editor({ project, onClose }: A3EditorProps) {
    const { updateLeanProject, currentUser } = useShopfloorStore();

    // Form State
    const [title, setTitle] = useState(project.title);
    const [status, setStatus] = useState<LeanProjectStatus>(project.status);
    const [background, setBackground] = useState(project.background || '');
    const [currentState, setCurrentState] = useState(project.currentState || '');
    const [targetState, setTargetState] = useState(project.targetState || '');
    const [gapAnalysis, setGapAnalysis] = useState(project.gapAnalysis || '');

    // Analysis Data State (V16)
    const [ishikawa, setIshikawa] = useState(project.analysisData?.ishikawa || {});
    const [fiveWhys, setFiveWhys] = useState(project.analysisData?.fiveWhys || []);
    const [containment, setContainment] = useState(project.analysisData?.containmentActions || '');
    const [rootCause, setRootCause] = useState(project.analysisData?.rootCause || '');

    const handleSave = async () => {
        try {
            await updateLeanProject(project.id, {
                title,
                status,
                background,
                currentState,
                targetState,
                gapAnalysis,
                analysisData: {
                    ishikawa,
                    fiveWhys,
                    containmentActions: containment,
                    rootCause: rootCause
                },
                updatedAt: new Date().toISOString()
            });
            toast.success("Projeto A3 salvo com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar projeto.");
            console.error(error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white min-h-screen p-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onClose}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            EDITAR A3: {project.title}
                            <Badge variant="outline">{status}</Badge>
                        </h1>
                        <p className="text-sm text-slate-500">Responsável: {project.ownerName}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir A3
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* A3 Layout Grid */}
            <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto border-2 border-slate-300 p-8 shadow-2xl bg-white print:border-none print:shadow-none print:p-0 print:w-full">

                {/* Header Section (Internal to A3) */}
                <div className="col-span-2 border-b-2 border-black pb-4 mb-4 flex justify-between items-end">
                    <div>
                        <Label className="text-xs uppercase text-slate-500 font-bold">Título do Projeto</Label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-xl font-bold border-none p-0 h-auto focus:ring-0 rounded-none border-b border-transparent hover:border-slate-300 w-full"
                        />
                    </div>
                    <div className="text-right">
                        <Label className="text-xs uppercase text-slate-500 font-bold">Status</Label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger className="w-[180px] h-8 border-none font-bold text-right">
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
                </div>

                {/* Left Column (Plan - Definition & Analysis) */}
                <div className="space-y-6 flex flex-col h-full border-r-2 border-dashed border-slate-300 pr-6 print:border-slate-800">

                    {/* 1. Background */}
                    <section className="space-y-2">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">1. Contexto & Background</div>
                        <Textarea
                            value={background}
                            onChange={e => setBackground(e.target.value)}
                            className="min-h-[100px] resize-none"
                            placeholder="Por que este problema é importante? Qual o impacto no negócio?"
                        />
                    </section>

                    {/* 2. Current State */}
                    <section className="space-y-2">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">2. Estado Atual & Indicadores</div>
                        <Textarea
                            value={currentState}
                            onChange={e => setCurrentState(e.target.value)}
                            className="min-h-[60px] resize-none"
                            placeholder="O que está acontecendo hoje? Descreva o cenário."
                        />
                        {/* Trend Chart Integration */}
                        <div className="mt-2">
                            <TrendChartEditor project={project} />
                        </div>

                        <div className="bg-red-50 p-2 border border-red-200 rounded mt-2">
                            <Label className="text-xs font-bold text-red-800">Ação de Contenção (Imediata)</Label>
                            <Input
                                value={containment}
                                onChange={e => setContainment(e.target.value)}
                                className="border-red-200 bg-white h-8 text-sm mt-1"
                                placeholder="O que foi feito pra 'estancar' o sangramento?"
                            />
                        </div>
                    </section>

                    {/* 3. Goal */}
                    <section className="space-y-2">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">3. Objetivo (Target Condition)</div>
                        <Textarea
                            value={targetState}
                            onChange={e => setTargetState(e.target.value)}
                            className="min-h-[60px] resize-none"
                            placeholder="Qual a meta? (Ex: Reduzir scrap de 5% para 2% até Dezembro)"
                        />
                    </section>

                    {/* 4. Root Cause Analysis */}
                    <section className="space-y-2 flex-1">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">4. Análise de Causa Raiz</div>
                        <Tabs defaultValue="ishikawa" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-8">
                                <TabsTrigger value="ishikawa" className="text-xs">Ishikawa (Fishbone)</TabsTrigger>
                                <TabsTrigger value="5whys" className="text-xs">5 Porquês</TabsTrigger>
                            </TabsList>
                            <TabsContent value="ishikawa" className="mt-2">
                                <IshikawaDiagram data={ishikawa} onChange={setIshikawa} />
                            </TabsContent>
                            <TabsContent value="5whys" className="mt-2 text-sm">
                                <FiveWhysInput data={fiveWhys} onChange={setFiveWhys} />
                            </TabsContent>
                        </Tabs>

                        <div className="mt-2">
                            <Label className="text-xs font-bold text-blue-800">Causa Raiz Confirmada:</Label>
                            <Input
                                value={rootCause}
                                onChange={e => setRootCause(e.target.value)}
                                className="font-semibold border-blue-200 bg-blue-50"
                                placeholder="A causa raiz validada é..."
                            />
                        </div>
                    </section>

                </div>

                {/* Right Column (Do, Check, Act - Countermeasures & Follow-up) */}
                <div className="space-y-6 flex flex-col h-full pl-2">

                    {/* 5. Countermeasures */}
                    <section className="space-y-2 flex-1">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">5. Contramedidas (Plano de Ação)</div>
                        <div className="border border-slate-200 rounded-md p-2 bg-slate-50 min-h-[300px]">
                            <ActionPlanEditor projectId={project.id} />
                        </div>
                    </section>

                    {/* 6. Check / Results */}
                    <section className="space-y-2">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">6. Resultados (Check)</div>
                        <div className="border border-slate-200 rounded-md h-[250px] p-2 bg-white">
                            {/* Reusing the TrendChart in read-only mode or simplified view */}
                            <TrendChartEditor project={project} readOnly={true} />
                        </div>
                    </section>

                    {/* 7. Follow Up / Standardize */}
                    <section className="space-y-2">
                        <div className="bg-slate-800 text-white px-2 py-1 text-sm font-bold uppercase w-full">7. Padronização & Lições (Act)</div>
                        <Textarea
                            className="min-h-[80px] resize-none"
                            placeholder="Quais documentos foram atualizados? O problema foi resolvido definitivamente?"
                        />
                    </section>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { size: A3 landscape; margin: 5mm; }
                    body * {
                        visibility: hidden;
                    }
                    .animate-in {
                        animation: none !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:border-none {
                        border: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:w-full {
                        width: 100% !important;
                        max-width: none !important;
                    }
                     /* Make the A3 Grid visible */
                    .grid, .grid * {
                        visibility: visible;
                    }
                    /* Ensure backgrounds print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
