"use client";

import React, { useState, useEffect } from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { LeanProject, LeanMetricLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface TrendChartEditorProps {
    project: LeanProject;
    readOnly?: boolean;
}

export function TrendChartEditor({ project, readOnly = false }: TrendChartEditorProps) {
    const { updateLeanProject, addMetricLog, getMetricLogs } = useShopfloorStore();

    // Metric Definition State
    const [metricName, setMetricName] = useState(project.metricName || '');
    const [metricUnit, setMetricUnit] = useState(project.metricUnit || '');
    const [metricTarget, setMetricTarget] = useState<string>(project.metricTarget?.toString() || '');

    // Data Logs State
    const [logs, setLogs] = useState<LeanMetricLog[]>([]);
    const [loading, setLoading] = useState(true);

    // New Log Entry State
    const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [newLogValue, setNewLogValue] = useState('');

    useEffect(() => {
        loadLogs();
    }, [project.id]);

    const loadLogs = async () => {
        const data = await getMetricLogs(project.id);
        setLogs(data);
        setLoading(false);
    };

    const handleSaveDefinition = async () => {
        await updateLeanProject(project.id, {
            metricName,
            metricUnit,
            metricTarget: metricTarget ? parseFloat(metricTarget) : undefined
        });
        toast.success("Definição de métrica salva!");
    };

    const handleAddLog = async () => {
        if (!newLogValue || !newLogDate) return;

        const newLog: LeanMetricLog = {
            id: uuidv4(),
            projectId: project.id,
            date: newLogDate,
            value: parseFloat(newLogValue)
        };

        await addMetricLog(newLog);
        setLogs([...logs, newLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setNewLogValue('');
        toast.success("Ponto de dado adicionado!");
    };

    // Prepare chart data
    const chartData = logs.map(l => ({
        date: new Date(l.date).toLocaleDateString(),
        value: l.value,
        target: (metricTarget && !isNaN(parseFloat(metricTarget))) ? parseFloat(metricTarget) : null
    }));

    return (
        <div className="space-y-4">
            {!readOnly && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-700">Configuração do Indicador</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs">Nome do Indicador</Label>
                                <Input
                                    placeholder="Ex: Taxa de Refugo"
                                    value={metricName}
                                    onChange={e => setMetricName(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Unidade</Label>
                                <Input
                                    placeholder="Ex: % or Kg"
                                    value={metricUnit}
                                    onChange={e => setMetricUnit(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Meta (Alvo)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 2.5"
                                    value={metricTarget}
                                    onChange={e => setMetricTarget(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button size="sm" onClick={handleSaveDefinition} className="w-full bg-slate-600 hover:bg-slate-700">
                            <Save className="h-3 w-3 mr-2" /> Salvar Definição
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Chart */}
            <div className="h-[250px] w-full border rounded-lg bg-white p-2">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" name={metricName || "Valor"} stroke="#2563eb" strokeWidth={2} />
                            {metricTarget && !isNaN(parseFloat(metricTarget)) && (
                                <ReferenceLine y={parseFloat(metricTarget)} label="Meta" stroke="red" strokeDasharray="3 3" />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                        Sem dados para exibir. Adicione registros abaixo.
                    </div>
                )}
            </div>

            {/* Data Entry (Log) */}
            {!readOnly && (
                <div className="flex gap-2 items-end bg-white p-2 rounded border border-slate-200">
                    <div className="flex-1">
                        <Label className="text-xs">Data</Label>
                        <Input
                            type="date"
                            value={newLogDate}
                            onChange={e => setNewLogDate(e.target.value)}
                            className="h-8"
                        />
                    </div>
                    <div className="flex-1">
                        <Label className="text-xs">Valor ({metricUnit})</Label>
                        <Input
                            type="number"
                            value={newLogValue}
                            onChange={e => setNewLogValue(e.target.value)}
                            placeholder="0.00"
                            className="h-8"
                        />
                    </div>
                    <Button size="sm" onClick={handleAddLog} className="h-8 bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </div>
            )}
        </div>
    );
}
