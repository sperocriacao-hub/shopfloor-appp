"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, CheckCircle2, AlertTriangle, FileText, ArrowLeft, StopCircle, CheckSquare, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ShopfloorPage() {
    const {
        assets, orders, events, employees,
        productOptions, optionTasks, taskExecutions, orderIssues,
        startOperation, stopOperation, toggleTask, reportIssue
    } = useShopfloorStore();

    // Session State
    const [selectedStationId, setSelectedStationId] = useState<string>("");
    const [view, setView] = useState<'select' | 'panel'>('select');

    // UI State
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({ type: 'material', description: '', relatedStationId: '' });

    // --- Derived Data ---
    const currentStation = assets.find(a => a.id === selectedStationId);

    // Active Order Logic
    const activeOrderEvent = events
        .filter(e => e.assetId === selectedStationId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const isRunning = activeOrderEvent?.type === 'START';
    const activeOrder = isRunning ? orders.find(o => o.id === activeOrderEvent.orderId) : null;

    // Available Orders (Planned for this Asset)
    const availableOrders = orders.filter(o =>
        (o.status === 'planned' || (o.status === 'in_progress' && !isRunning)) &&
        o.assetId === selectedStationId
    );

    // Checklist Logic
    const activeOrderOptions = activeOrder?.selectedOptions || [];
    const activeTasks = optionTasks
        .filter(t => activeOrderOptions.includes(t.optionId))
        .sort((a, b) => a.sequence - b.sequence);

    // Check completion
    const completedTaskIds = taskExecutions
        .filter(te => te.orderId === activeOrder?.id && te.completedAt)
        .map(te => te.taskId);

    const isChecklistComplete = activeTasks.length > 0 && activeTasks.every(t => completedTaskIds.includes(t.id));
    const progressPercent = activeTasks.length > 0 ? Math.round((completedTaskIds.length / activeTasks.length) * 100) : 0;

    // Issues Logic
    const activeIssues = orderIssues.filter(i => i.orderId === activeOrder?.id && i.status === 'open');

    // Employees Logic
    const stationEmployees = employees.filter(e => e.workstation === currentStation?.name || e.area === currentStation?.area);

    // --- Handlers ---

    const handleStart = async (orderId: string) => {
        if (!selectedStationId) return;
        await startOperation(orderId, selectedStationId);
    };

    const handleTaskToggle = async (taskId: string) => {
        if (!activeOrder) return;
        const isCompleted = completedTaskIds.includes(taskId);
        // Toggle logic
        await toggleTask(activeOrder.id, taskId, !isCompleted, "user-tablet"); // TODO: Add real user ID later
    };

    const handleFinishOrder = async () => {
        if (!activeOrder || !selectedStationId) return;
        if (!isChecklistComplete && activeTasks.length > 0) return alert("Complete todas as tarefas antes de finalizar.");

        if (confirm("Confirma finalização da ordem?")) {
            await stopOperation(activeOrder.id, selectedStationId, "Conclusão", true);
        }
    };

    const handleReportIssue = async () => {
        if (!activeOrder || !issueForm.description) return;
        await reportIssue({
            id: `iss-${Date.now()}`,
            orderId: activeOrder.id,
            stationId: selectedStationId,
            relatedStationId: issueForm.relatedStationId || selectedStationId, // Default to self if not specified, or allow empty
            type: issueForm.type as any,
            description: issueForm.description,
            status: 'open',
            createdAt: new Date().toISOString()
        });
        setShowIssueModal(false);
        setIssueForm({ type: 'material', description: '', relatedStationId: '' });
    };

    // --- Views ---

    if (view === 'select') {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
                <Card className="w-full max-w-md shadow-xl border-t-8 border-t-blue-600">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl text-blue-900">Operator Login</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Selecione sua Estação</label>
                            <Select onValueChange={setSelectedStationId} value={selectedStationId}>
                                <SelectTrigger className="h-14 text-lg">
                                    <SelectValue placeholder="Escolher Estação..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {assets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id}>
                                            {asset.area} - {asset.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700"
                            disabled={!selectedStationId}
                            onClick={() => setView('panel')}
                        >
                            ENTRAR
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!currentStation) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => setView('select')}>
                        <ArrowLeft className="mr-2 h-5 w-5" /> Sair
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{currentStation.name}</h1>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">{currentStation.area} / Shopfloor App</p>
                    </div>
                </div>
                {isRunning && activeOrder && (
                    <div className="bg-blue-600 px-4 py-2 rounded-md animate-pulse">
                        <span className="font-bold text-sm">EM OPERAÇÃO: {activeOrder.productModelId}</span>
                    </div>
                )}
            </header>

            <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Left / Main Area --- */}
                <div className="lg:col-span-2 space-y-6">

                    {!isRunning ? (
                        // IDLE STATE: List of Orders
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-700 flex items-center">
                                <Clock className="mr-2 h-5 w-5" /> Ordens Disponíveis ({availableOrders.length})
                            </h2>
                            {availableOrders.length === 0 ? (
                                <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-100/50">
                                    <p className="text-slate-500 font-medium">Nenhuma ordem agendada para esta estação.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {availableOrders.map(order => (
                                        <Card key={order.id} className="hover:border-blue-500 transition-all cursor-pointer group" onClick={() => handleStart(order.id)}>
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div>
                                                    <div className="text-2xl font-bold text-blue-900 mb-1">{order.productModelId}</div>
                                                    <div className="text-sm text-slate-500 flex gap-4">
                                                        <span><strong>Qtd:</strong> {order.quantity}</span>
                                                        <span><strong>PO:</strong> {order.po || '-'}</span>
                                                        <span><strong>Cliente:</strong> {order.customer || '-'}</span>
                                                    </div>
                                                </div>
                                                <Button size="lg" className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <PlayCircle className="h-8 w-8" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // RUNNING STATE: Checklist
                        <div className="space-y-6">
                            {/* Order Info Banner */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Ordem Atual</p>
                                    <h2 className="text-2xl font-bold text-slate-900">{activeOrder?.productModelId}</h2>
                                    <p className="text-sm text-slate-600">PO: {activeOrder?.po}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono font-bold text-blue-600">
                                        {progressPercent}%
                                    </div>
                                    <p className="text-xs text-slate-400">Progresso</p>
                                </div>
                            </div>

                            {/* The Checklist */}
                            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-800 flex items-center">
                                        <CheckSquare className="mr-2 h-5 w-5 text-slate-500" />
                                        Lista de Tarefas
                                    </h3>
                                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{completedTaskIds.length}/{activeTasks.length}</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {activeTasks.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 italic">
                                            Nenhuma tarefa de checklist configurada para este modelo/opcionais.
                                        </div>
                                    ) : (
                                        activeTasks.map(task => {
                                            const isDone = completedTaskIds.includes(task.id);
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "p-4 flex items-start gap-4 transition-colors",
                                                        isDone ? "bg-green-50/50" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => handleTaskToggle(task.id)}
                                                        className={cn(
                                                            "mt-1 h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                                            isDone ? "bg-green-500 border-green-500 text-white" : "border-slate-300 text-transparent hover:border-green-400"
                                                        )}
                                                    >
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </button>

                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "text-lg font-medium transition-all",
                                                            isDone ? "text-green-800 line-through opacity-70" : "text-slate-800"
                                                        )}>
                                                            {task.description}
                                                        </p>
                                                        {task.pdfUrl && (
                                                            <a
                                                                href={task.pdfUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center mt-1 text-xs font-medium text-blue-600 hover:underline"
                                                            >
                                                                <FileText className="h-3 w-3 mr-1" /> Ver Instrução (PDF)
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Right / Sidebar Controls --- */}
                {isRunning && (
                    <div className="space-y-6">
                        {/* Issues Alert Box */}
                        {activeIssues.length > 0 && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-red-700 text-sm flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Problemas em Aberto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {activeIssues.map(iss => (
                                        <div key={iss.id} className="text-xs bg-white p-2 rounded border border-red-100 text-red-800">
                                            <strong>{iss.type}:</strong> {iss.description}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        {/* Staff List */}
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-blue-900 text-sm flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    Equipe na Estação
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {stationEmployees.length > 0 ? (
                                    stationEmployees.map(emp => (
                                        <div key={emp.id} className="text-xs bg-white/60 p-1.5 rounded flex justify-between items-center">
                                            <span className="font-medium text-blue-900">{emp.name}</span>
                                            <span className="text-[10px] text-blue-400 bg-blue-100 px-1 rounded">{emp.jobTitle}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-blue-400 italic">Nenhum operador alocado.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="grid gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
                                onClick={() => setShowIssueModal(true)}
                            >
                                <AlertTriangle className="mr-2 h-6 w-6" />
                                Reportar Problema
                            </Button>

                            <Button
                                size="lg"
                                className={cn(
                                    "h-24 text-xl shadow-lg transition-all",
                                    isChecklistComplete
                                        ? "bg-green-600 hover:bg-green-700 hover:scale-[1.02]"
                                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                                )}
                                disabled={!isChecklistComplete}
                                onClick={handleFinishOrder}
                            >
                                {isChecklistComplete ? (
                                    <>
                                        <CheckCircle2 className="mr-3 h-8 w-8" />
                                        FINALIZAR ORDEM
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <span className="flex items-center"><StopCircle className="mr-2 h-5 w-5" /> Finalizar</span>
                                        <span className="text-xs font-normal mt-1 opacity-70">Conclua o checklist primeiro</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg shadow-2xl">
                        <CardHeader>
                            <CardTitle>Reportar Problema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Tipo de Problema</Label>
                                <Select
                                    value={issueForm.type}
                                    onValueChange={v => setIssueForm({ ...issueForm, type: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="material">Falta de Material</SelectItem>
                                        <SelectItem value="adjust">Ajuste Técnico</SelectItem>
                                        <SelectItem value="blockage">Bloqueio / Quebra</SelectItem>
                                        <SelectItem value="other">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(issueForm.type === 'material' || issueForm.type === 'adjust') && (
                                <div>
                                    <Label>Estação Causadora (Responsável)</Label>
                                    <Select
                                        value={issueForm.relatedStationId}
                                        onValueChange={v => setIssueForm({ ...issueForm, relatedStationId: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Selecione quem causou..." /></SelectTrigger>
                                        <SelectContent>
                                            {assets.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.area} - {a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label>Descrição</Label>
                                <Textarea
                                    value={issueForm.description}
                                    onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                                    placeholder="Descreva o que aconteceu..."
                                    className="h-24"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setShowIssueModal(false)}>Cancelar</Button>
                                <Button variant="destructive" onClick={handleReportIssue}>Enviar Reporte</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
