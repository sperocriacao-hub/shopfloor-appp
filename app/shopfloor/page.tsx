"use client";

import { useState, useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, StopCircle, Clock, Users, ArrowLeft, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionOrder } from "@/types";

export default function ShopfloorPage() {
    const { assets, employees, orders, events, absenteeismRecords, startOperation, stopOperation } = useShopfloorStore();

    // Local State for Tablet Session
    const [selectedStationId, setSelectedStationId] = useState<string>("");
    const [view, setView] = useState<'select' | 'panel'>('select');
    const [showStopModal, setShowStopModal] = useState(false);
    const [stopReason, setStopReason] = useState("");

    // Computed
    const currentStation = assets.find(a => a.id === selectedStationId);

    // Station Staff
    const allocatedStaff = employees.filter(e =>
        e.area === currentStation?.area &&
        (!e.workstation || e.workstation.includes(currentStation?.name || ''))
    );

    const isEmployeePresent = (empId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const abs = absenteeismRecords.find(r => r.employeeId === empId && r.date === today);
        return !abs; // If no absenteeism record, assumed present (simplification)
        // In a real system, we'd also check if they clocked in.
    };

    // Current Active Order on this Station
    // Find the latest START event for this asset without a corresponding STOP
    // This is a simplified logic. Ideally, store should track 'currentOrderId' on Asset.
    const activeOrderEvent = events
        .filter(e => e.assetId === selectedStationId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const isRunning = activeOrderEvent?.type === 'START';
    const activeOrder = isRunning ? orders.find(o => o.id === activeOrderEvent.orderId) : null;

    // Available Orders to Start (Planned for this Area)
    const availableOrders = orders.filter(o =>
        o.status === 'planned' || (o.status === 'in_progress' && !isRunning)
    ); // Simplification: show all planned orders. Ideally filter by area/routing.

    const handleStart = async (orderId: string) => {
        if (!selectedStationId) return;
        await startOperation(orderId, selectedStationId);
    };

    const handleStop = async () => {
        if (!selectedStationId || !activeOrder) return;
        await stopOperation(activeOrder.id, selectedStationId, stopReason);
        setShowStopModal(false);
        setStopReason("");
    };

    if (view === 'select') {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl text-blue-900">Login da Estação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Selecione a Estação / Ativo</label>
                            <Select onValueChange={setSelectedStationId} value={selectedStationId}>
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="Escolher Estação..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {assets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id}>
                                            {asset.name} <span className="text-xs text-muted-foreground ml-2">({asset.area})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                            disabled={!selectedStationId}
                            onClick={() => setView('panel')}
                        >
                            Acessar Painel
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
            <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:bg-slate-800" onClick={() => setView('select')}>
                        <ArrowLeft className="mr-2 h-5 w-5" /> Sair
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{currentStation.name}</h1>
                        <p className="text-slate-400 text-sm">{currentStation.area} - {currentStation.subarea}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold">{new Date().toLocaleTimeString()}</p>
                        <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Production Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <Card className={cn("border-l-8 shadow-md", isRunning ? "border-l-blue-500" : "border-l-slate-300")}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Status Atual</p>
                                <h2 className={cn("text-4xl font-bold mt-1", isRunning ? "text-blue-600" : "text-slate-700")}>
                                    {isRunning ? "EM PRODUÇÃO" : "AGUARDANDO"}
                                </h2>
                                {isRunning && activeOrder && (
                                    <div className="mt-2 text-lg text-slate-800">
                                        Ordem: <strong>{activeOrder.po || activeOrder.id}</strong> | Modelo: {activeOrder.productModelId}
                                    </div>
                                )}
                            </div>
                            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                                {isRunning ? (
                                    <Clock className="h-10 w-10 text-blue-600 animate-pulse" />
                                ) : (
                                    <StopCircle className="h-10 w-10 text-slate-400" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Area */}
                    <div className="grid grid-cols-1 gap-4">
                        {isRunning ? (
                            <Button
                                className="h-32 text-2xl bg-red-600 hover:bg-red-700 shadow-xl"
                                onClick={() => setShowStopModal(true)}
                            >
                                <StopCircle className="mr-4 h-12 w-12" />
                                PARAR PRODUÇÃO
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-700">Selecione uma Ordem para Iniciar:</h3>
                                <div className="grid gap-3">
                                    {availableOrders.length === 0 && (
                                        <div className="p-8 text-center border-2 border-dashed rounded-lg text-slate-400">
                                            Nenhuma ordem planejada encontrada.
                                        </div>
                                    )}
                                    {availableOrders.map(order => (
                                        <Button
                                            key={order.id}
                                            variant="outline"
                                            className="h-20 justify-start px-6 text-left border-slate-300 hover:border-blue-500 hover:bg-blue-50 group"
                                            onClick={() => handleStart(order.id)}
                                        >
                                            <PlayCircle className="mr-4 h-8 w-8 text-slate-400 group-hover:text-blue-600" />
                                            <div>
                                                <div className="font-bold text-lg text-slate-800 group-hover:text-blue-900">
                                                    {order.po || `Ordem #${order.id.substr(0, 8)}`}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    Modelo: {order.productModelId} | Qtd: {order.quantity}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Info & Staff */}
                <div className="space-y-6">
                    {/* Staff List */}
                    <Card className="h-full shadow-md flex flex-col">
                        <CardHeader className="bg-slate-50 border-b pb-3">
                            <CardTitle className="flex items-center text-lg text-slate-800">
                                <Users className="mr-2 h-5 w-5 text-blue-600" />
                                Equipe Alocada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-y-auto">
                            {allocatedStaff.length === 0 ? (
                                <p className="p-6 text-center text-slate-400 text-sm">Nenhum funcionário alocado especificamente para esta estação.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {allocatedStaff.map(emp => {
                                        const present = isEmployeePresent(emp.id);
                                        return (
                                            <li key={emp.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                                <div className="flex items-center">
                                                    <div className={cn(
                                                        "h-3 w-3 rounded-full mr-3 ring-2 ring-white shadow-sm",
                                                        present ? "bg-green-500" : "bg-red-500"
                                                    )} />
                                                    <div>
                                                        <p className="font-medium text-slate-900">{emp.name}</p>
                                                        <p className="text-xs text-slate-500">{emp.jobTitle || 'Operador'}</p>
                                                    </div>
                                                </div>
                                                {!present && (
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                                        AUSENTE
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Stop Modal */}
            {showStopModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-red-700 flex items-center">
                                <AlertTriangle className="mr-2" />
                                Reportar Parada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-600">Por favor, informe o motivo da parada ou conclusão:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['Conclusão Turno', 'Conclusão Ordem', 'Falta Material', 'Quebra Máquina', 'Almoço/Intervalo', 'Outros'].map(reason => (
                                    <Button
                                        key={reason}
                                        variant={stopReason === reason ? "default" : "outline"}
                                        onClick={() => setStopReason(reason)}
                                        className={cn("h-12", stopReason === reason ? "bg-red-600 hover:bg-red-700" : "")}
                                    >
                                        {reason}
                                    </Button>
                                ))}
                            </div>
                            {stopReason === 'Outros' && (
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Descreva o motivo..."
                                />
                            )}
                            <div className="flex gap-2 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={() => setShowStopModal(false)}>Cancelar</Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    disabled={!stopReason}
                                    onClick={handleStop}
                                >
                                    Confirmar Parada
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}
