"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, CheckCircle2, AlertTriangle, FileText, ArrowLeft, StopCircle, CheckSquare, Clock, Users, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ScrapReport } from "@/types";

export default function ShopfloorPage() {
    const {
        assets, orders, events, employees,
        productOptions, optionTasks, taskExecutions, orderIssues,
        startOperation, stopOperation, toggleTask, reportIssue,
        addQualityCase, addScrapReport
    } = useShopfloorStore();

    // Session State
    const [selectedStationId, setSelectedStationId] = useState<string>("");
    const [view, setView] = useState<'select' | 'panel'>('select');

    // UI State
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({ type: 'material', description: '', relatedStationId: '' });

    // Quality Modal State
    const [showQualityModal, setShowQualityModal] = useState(false);
    const [qualityForm, setQualityForm] = useState({ description: '', severity: 'medium' });

    // Scrap Modal State
    const [showScrapModal, setShowScrapModal] = useState(false);
    const [scrapForm, setScrapForm] = useState({ quantity: 1, reason: 'process_fail', actionTaken: 'discard', itemDescription: '' });

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
    // Derived Logic for Sequencing
    const getTaskStatus = (taskId: string, index: number) => {
        const isCompleted = completedTaskIds.includes(taskId);
        const prevTask = index > 0 ? activeTasks[index - 1] : null;
        const isPrevDone = prevTask ? completedTaskIds.includes(prevTask.id) : true;
        const isLocked = !isPrevDone && !isCompleted;
        return { isCompleted, isLocked };
    };

    // Employees Logic (Refined: Match Area AND (Station OR Generic))
    const stationEmployees = employees.filter(e =>
        e.area === currentStation?.area &&
        (!e.workstation || e.workstation === currentStation?.name)
    );

    // Timer Logic
    const startTime = activeOrderEvent ? new Date(activeOrderEvent.timestamp) : null;
    const elapsedMinutes = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 60000) : 0;
    // Mock estimated time (sum of task times or default) - in real app comes from routing
    const estimatedMinutes = activeTasks.length * 15; // 15 min per task assumption
    const timeColor = elapsedMinutes > estimatedMinutes ? 'text-red-600' : 'text-slate-600';

    // --- Handlers ---

    const handleStart = async (orderId: string) => {
        if (!selectedStationId) return;
        await startOperation(orderId, selectedStationId);
    };

    const handleTaskToggle = async (taskId: string, index: number) => {
        if (!activeOrder) return;
        const { isCompleted, isLocked } = getTaskStatus(taskId, index);

        if (isLocked) {
            const password = prompt("BLOQUEIO DE SEQUÊNCIA: Tarefa anterior pendente.\nInsira senha de supervisor para liberar (1234):");
            if (password !== process.env.NEXT_PUBLIC_SUPERVISOR_PWD && password !== "1234") {
                return alert("Senha incorreta.");
            }
            // If correct, allow toggle (override)
        }

        // Toggle logic
        await toggleTask(activeOrder.id, taskId, !isCompleted, "user-tablet");
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

    const handleReportQuality = async () => {
        if (!activeOrder || !qualityForm.description) return;
        await addQualityCase({
            id: `qc-${Date.now()}`,
            createdAt: new Date().toISOString(),
            description: qualityForm.description,
            type: 'internal', // Default for shopfloor
            severity: qualityForm.severity as any,
            status: 'open',
            methodology: 'ishikawa', // Default
            assetId: selectedStationId,
            orderId: activeOrder.id,
            createdBy: "Operator" // TODO: Real user
        });
        setShowQualityModal(false);
        setQualityForm({ description: '', severity: 'medium' });
        alert("Não conformidade registrada com sucesso.");
    };

    const handleReportScrap = async () => {
        if (!activeOrder || !currentStation) return;

        // 1. Determine Type
        const isReplacement = scrapForm.actionTaken === 'replacement';
        const type = isReplacement ? 'total' : 'partial';

        // 2. Prepare Report Data
        const report: ScrapReport = {
            id: crypto.randomUUID(),
            orderId: activeOrder.id,
            assetId: currentStation.id,
            reportedBy: selectedEmployeeId || 'unknown',
            type,
            itemDescription: scrapForm.itemDescription || activeOrder.productModelId,
            quantity: scrapForm.quantity,
            reason: scrapForm.reason,
            actionTaken: scrapForm.actionTaken as any,
            createdAt: new Date().toISOString()
        };

        // 3. Logic for Replacement (Create new order if needed)
        if (isReplacement) {
            // Logic to request new order would go here (e.g. notify planner or create planned order)
            // For now, we just flag it in the report 
            const newOrderId = `PO-REP-${activeOrder.id.split('-')[1]}-${Math.floor(Math.random() * 1000)}`;
            // In a real app we'd actually create the order via addOrder, but let's keep it simple for now as per requirements
            report.replacementOrderId = newOrderId;

            toast.error(`Refugo registrado! Solicitação de reposição gerada (Ref: ${newOrderId})`);
        } else {
            toast.warning(`Refugo registrado: ${scrapForm.quantity} itens descartados/retrabalhados.`);
        }

        // 4. Save to Store/DB
        if (addScrapReport) {
            await addScrapReport(report);
        } else {
            console.error("addScrapReport action missing in store");
        }

        setShowScrapModal(false);
        setScrapForm({ quantity: 1, reason: 'process_fail', actionTaken: 'discard', itemDescription: '' });
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
                            <SearchableSelect
                                options={assets.map(asset => ({ value: asset.id, label: `${asset.area} - ${asset.name}` }))}
                                value={selectedStationId}
                                onChange={setSelectedStationId}
                                placeholder="Escolher Estação..."
                                className="h-14 text-lg"
                            />
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
                                    <div className="flex gap-4 text-sm mt-1">
                                        <span className="text-slate-600">PO: {activeOrder?.po}</span>
                                        <span className={`flex items-center font-mono font-medium ${timeColor}`}>
                                            <Clock className="h-4 w-4 mr-1" />
                                            {elapsedMinutes}m / {estimatedMinutes}m (Est.)
                                        </span>
                                    </div>
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
                                        Lista de Tarefas (Sequencial)
                                    </h3>
                                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{completedTaskIds.length}/{activeTasks.length}</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {activeTasks.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 italic">
                                            Nenhuma tarefa de checklist configurada para este modelo/opcionais.
                                        </div>
                                    ) : (
                                        activeTasks.map((task, index) => {
                                            const { isCompleted, isLocked } = getTaskStatus(task.id, index);
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "p-4 flex items-start gap-4 transition-colors",
                                                        isCompleted ? "bg-green-50/50" : isLocked ? "bg-slate-100 opacity-60" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => handleTaskToggle(task.id, index)}
                                                        className={cn(
                                                            "mt-1 h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                                            isCompleted ? "bg-green-500 border-green-500 text-white" :
                                                                isLocked ? "border-slate-300 bg-slate-200 cursor-not-allowed text-slate-400" : "border-slate-300 text-transparent hover:border-green-400"
                                                        )}
                                                    >
                                                        {isLocked && !isCompleted ? <StopCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                                    </button>

                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "text-lg font-medium transition-all",
                                                            isCompleted ? "text-green-800 line-through opacity-70" : "text-slate-800"
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

                            {currentStation.enableQualityModule && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-16 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                                    onClick={() => setShowQualityModal(true)}
                                >
                                    <Microscope className="mr-2 h-6 w-6" />
                                    Não Conformidade
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                onClick={() => setShowScrapModal(true)}
                            >
                                <AlertTriangle className="mr-2 h-6 w-6" />
                                Refugo (Scrap)
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
                                    <SearchableSelect
                                        options={assets.map(a => ({ value: a.id, label: `${a.area} - ${a.name}` }))}
                                        value={issueForm.relatedStationId}
                                        onChange={v => setIssueForm({ ...issueForm, relatedStationId: v })}
                                        placeholder="Selecione quem causou..."
                                    />
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

            {/* Quality Modal */}
            {showQualityModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg shadow-2xl border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-900 flex items-center">
                                <Microscope className="mr-2 h-5 w-5" />
                                Registrar Não Conformidade (Qualidade)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Severidade</Label>
                                <Select
                                    value={qualityForm.severity}
                                    onValueChange={v => setQualityForm({ ...qualityForm, severity: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baixa (Cosmético)</SelectItem>
                                        <SelectItem value="medium">Média (Retrabalho)</SelectItem>
                                        <SelectItem value="high">Alta (Perda Funcional)</SelectItem>
                                        <SelectItem value="critical">Crítica (Segurança)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Descrição do Defeito</Label>
                                <Textarea
                                    value={qualityForm.description}
                                    onChange={e => setQualityForm({ ...qualityForm, description: e.target.value })}
                                    placeholder="Descreva o que está fora do padrão..."
                                    className="h-32"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setShowQualityModal(false)}>Cancelar</Button>
                                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleReportQuality}>Registrar NC</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Scrap Modal */}
            {showScrapModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg shadow-2xl border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-900 flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                Reportar Refugo (Perda)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Quantidade Perdida</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={scrapForm.quantity}
                                        onChange={e => setScrapForm({ ...scrapForm, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <Label>Ação</Label>
                                    <Select
                                        value={scrapForm.actionTaken}
                                        onValueChange={v => setScrapForm({ ...scrapForm, actionTaken: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="discard">Descarte Simples</SelectItem>
                                            <SelectItem value="rework">Retrabalho Interno</SelectItem>
                                            <SelectItem value="replacement">Solicitar Reposição (Nova OP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Motivo</Label>
                                <Select
                                    value={scrapForm.reason}
                                    onValueChange={v => setScrapForm({ ...scrapForm, reason: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="process_fail">Falha de Processo</SelectItem>
                                        <SelectItem value="machine_fail">Falha de Máquina</SelectItem>
                                        <SelectItem value="material_defect">Defeito de Material</SelectItem>
                                        <SelectItem value="operator_error">Erro Operacional</SelectItem>
                                        <SelectItem value="setup_part">Peça de Setup/Teste</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setShowScrapModal(false)}>Cancelar</Button>
                                <Button className="bg-red-600 hover:bg-red-700" onClick={handleReportScrap}>Confirmar Refugo</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
