"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, AlertTriangle, CheckSquare, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function OrderDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const { orders, products, productOptions, events, assets, optionTasks, taskExecutions } = useShopfloorStore();

    const order = orders.find(o => o.id === params.id);
    const product = products.find(p => p.id === order?.productModelId);

    if (!order || !product) return <div className="p-8">Ordem não encontrada</div>;

    // --- Derived Data Calculations ---

    // 1. Options Attached
    const attachedOptions = productOptions.filter(opt =>
        order.selectedOptions?.includes(opt.id)
    );

    // 2. Metrics (Real Data)
    const orderEvents = events.filter(e => e.orderId === order.id);
    const stopEvents = orderEvents.filter(e => e.type === 'STOP').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Progress Calculation (Based on Checklist Tasks)
    const orderTasks = optionTasks.filter(t => order.selectedOptions?.includes(t.optionId));
    const completedTasksCount = useShopfloorStore.getState().taskExecutions.filter(te => te.orderId === order.id).length; // Direct store access for fresh data if needed, or rely on hook
    // Actually use hook data:
    const myExecutions = useShopfloorStore(s => s.taskExecutions).filter(te => te.orderId === order.id);

    const progress = orderTasks.length > 0
        ? Math.round((myExecutions.length / orderTasks.length) * 100)
        : (order.status === 'completed' ? 100 : 0);

    const oee = 85; // Still mocked as it requires complex shift logic
    const totalTimeHours = 0; // Placeholder

    // 3. Issues (Real Stoppages)
    const issues = stopEvents.slice(0, 5);

    // 4. Time per Station (Mocked vs Average)
    const stationData = [
        { name: 'Laminação', current: 12, average: 10 },
        { name: 'Montagem', current: 45, average: 40 },
        { name: 'Acabamento', current: 20, average: 25 },
        { name: 'Elétrica', current: 15, average: 18 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            {product.name} <span className="text-slate-400">#</span> {order.hin || order.po || order.id}
                        </h1>
                        <p className="text-sm text-slate-500">Painel de Monitoramento da Ordem (Read-Only)</p>
                    </div>
                </div>
                <div className="flex gap-4 text-right">
                    <div>
                        <p className="text-xs text-slate-400">Cliente</p>
                        <p className="font-medium">{order.customer}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase">
                            {order.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">OEE Global</CardTitle>
                        <BarChart2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{oee}%</div>
                        <p className="text-xs text-slate-500">Simulado (Sem Histórico)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progresso Checklist</CardTitle>
                        <CheckSquare className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress}%</div>
                        <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${progress}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Horas Apontadas</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTimeHours}h</div>
                        <p className="text-xs text-slate-500">Estimado: -</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Intercorrências</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{issues.length}</div>
                        <p className="text-xs text-slate-500">Paradas registradas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Comparisons & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Time Comparison Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tempo Real vs Média Histórica (por Estação)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stationData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" unit="h" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="average" name="Média Histórica" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="current" name="Ordem Atual" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Stoppages Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-700 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Registro de Paradas (Intercorrências)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {issues.length === 0 ? (
                                <p className="text-slate-500 text-sm">Nenhuma parada crítica registrada para esta ordem.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {issues.map((issue, idx) => (
                                        <li key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                            <div>
                                                <p className="font-medium text-slate-800">{issue.reason || "Motivo não especificado"}</p>
                                                <p className="text-xs text-slate-500">Estação: {assets.find(a => a.id === issue.assetId)?.name || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                                                    {new Date(issue.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Configuration */}
                <div className="space-y-6">

                    {/* V7 Parts Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Rastreamento de Partes (RFID)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {products.find(p => p.id === order.productModelId) && useShopfloorStore.getState().productParts
                                .filter(pp => pp.productModelId === order.productModelId).length === 0 ? (
                                <p className="text-xs text-slate-400">Nenhuma parte definida para este modelo.</p>
                            ) : (
                                useShopfloorStore.getState().productParts
                                    .filter(pp => pp.productModelId === order.productModelId)
                                    .map(part => {
                                        const orderPart = useShopfloorStore.getState().orderParts
                                            .find(op => op.orderId === order.id && op.partDefinitionId === part.id);

                                        return (
                                            <div key={part.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-sm text-slate-700">{part.name}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${part.category === 'Big' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>{part.category}</span>
                                                </div>

                                                {orderPart ? (
                                                    <div className="flex items-center gap-2 text-xs bg-green-50 p-2 rounded border border-green-200 text-green-800">
                                                        <CheckSquare className="h-3 w-3" />
                                                        <span>RFID: <strong>{orderPart.rfidTag}</strong></span>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Scan RFID/Digitar ID"
                                                            className="flex-1 text-xs border rounded px-2 py-1"
                                                            onKeyDown={async (e) => {
                                                                if (e.key === 'Enter') {
                                                                    const val = e.currentTarget.value;
                                                                    if (!val) return;
                                                                    await useShopfloorStore.getState().addOrderPart({
                                                                        id: crypto.randomUUID(),
                                                                        orderId: order.id,
                                                                        partDefinitionId: part.id,
                                                                        rfidTag: val,
                                                                        status: 'produced',
                                                                        producedAt: new Date().toISOString()
                                                                    });
                                                                    e.currentTarget.value = "";
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </CardContent>
                    </Card>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Opcionais & Kits Instalados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {attachedOptions.length === 0 && (
                                    <p className="text-sm text-slate-400">Nenhum opcional vinculado.</p>
                                )}
                                {attachedOptions.map(opt => {
                                    // Count tasks for this option
                                    const taskCount = optionTasks.filter(t => t.optionId === opt.id).length;
                                    return (
                                        <li key={opt.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                                            <p className="font-semibold text-sm text-slate-800">{opt.name}</p>
                                            <p className="text-xs text-slate-500 mb-2">{opt.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white p-1 rounded border">
                                                <CheckSquare className="h-3 w-3" />
                                                {taskCount} tarefas de checklist
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
