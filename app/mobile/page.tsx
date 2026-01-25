"use client";

import { useState, useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, StopCircle, AlertTriangle, CheckCircle2, Wifi, Scan } from "lucide-react";
import { toast } from "sonner";
import { Alert } from "@/types";

export default function MobileShopfloorPage() {
    const {
        assets, orders, events, employees,
        findStationByFixedId, findEmployeeByRfid,
        startOperation, stopOperation, triggerAndon,
        alerts
    } = useShopfloorStore();

    // Session State
    const [stationId, setStationId] = useState<string>("");
    const [employeeId, setEmployeeId] = useState<string>("");
    const [scanInput, setScanInput] = useState("");

    // UI Logic
    const currentStation = assets.find(a => a.id === stationId);
    const validOrders = orders.filter(o => o.assetId === stationId && o.status !== 'completed'); // Simplified filter
    const activeOrderEvent = events
        .filter(e => e.assetId === stationId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const isRunning = activeOrderEvent?.type === 'START';
    const activeOrder = isRunning ? orders.find(o => o.id === activeOrderEvent.orderId) : null;

    // Handle Scan (Generic input for Station/Employee)
    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        const tag = scanInput.trim().toUpperCase();
        if (!tag) return;

        // 1. Station
        const station = findStationByFixedId(tag);
        if (station) {
            setStationId(station.id);
            toast.success(`Estação: ${station.name}`);
            setScanInput("");
            return;
        }

        // 2. Employee
        const emp = findEmployeeByRfid(tag);
        if (emp) {
            setEmployeeId(emp.id);
            toast.success(`Operador: ${emp.name}`);
            setScanInput("");
            return;
        }

        // 3. Command? (Future)

        toast.error("Tag desconhecida");
        setScanInput("");
    };

    const handleAndon = async (type: Alert['type']) => {
        if (!stationId) return;

        await triggerAndon({
            id: `alert-${Date.now()}`,
            stationId,
            type,
            status: 'open',
            createdAt: new Date().toISOString(),
            description: `Alerta acionado via Mobile por ${employees.find(e => e.id === employeeId)?.name || 'Anon'}`
        });
        toast.success(`Andon ${type.toUpperCase()} acionado!`);
    };

    if (!stationId) {
        return (
            <div className="flex flex-col h-screen bg-slate-100 p-4 justify-center items-center">
                <Card className="w-full max-w-sm">
                    <CardContent className="pt-6 flex flex-col items-center gap-4">
                        <Scan className="h-16 w-16 text-slate-400" />
                        <h1 className="text-xl font-bold text-slate-700">Scan Station Tag</h1>
                        <p className="text-sm text-slate-500 text-center">
                            Leia o código da estação para conectar o dispositivo.
                        </p>
                        <form onSubmit={handleScan} className="w-full flex gap-2">
                            <Input
                                value={scanInput}
                                onChange={e => setScanInput(e.target.value)}
                                placeholder="Ou digite ID..."
                                autoFocus
                            />
                            <Button type="submit">OK</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white p-2 safe-area-inset-top">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 p-2 border-b border-slate-800">
                <div>
                    <h2 className="font-bold text-lg leading-none">{currentStation?.name}</h2>
                    <span className="text-xs text-slate-400">
                        {employees.find(e => e.id === employeeId)?.name || "Sem Operador"}
                    </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-green-500" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Status Card */}
                <div className={`p-4 rounded-lg flex flex-col items-center justify-center h-32 ${isRunning ? 'bg-green-600' : 'bg-slate-800'}`}>
                    <span className="text-xs uppercase font-bold text-white/70">Produção</span>
                    <span className="text-3xl font-bold">{isRunning ? "RODANDO" : "PARADO"}</span>
                    {isRunning && <span className="text-sm mt-1">{activeOrder?.po}</span>}
                </div>

                {/* Main Action */}
                {!isRunning ? (
                    <Button
                        size="lg"
                        className="h-24 text-2xl font-bold bg-green-600 hover:bg-green-500 rounded-xl"
                        onClick={() => {
                            const nextOrder = validOrders.find(o => o.status === 'planned');
                            if (nextOrder) startOperation(nextOrder.id, stationId);
                            else toast.error("Sem ordens planejadas");
                        }}
                    >
                        <PlayCircle className="mr-3 h-8 w-8" /> INICIAR
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="h-24 text-2xl font-bold bg-red-600 hover:bg-red-500 rounded-xl"
                        onClick={() => activeOrderEvent && stopOperation(activeOrderEvent.orderId, stationId)}
                    >
                        <StopCircle className="mr-3 h-8 w-8" /> PARAR
                    </Button>
                )}

                {/* Andon Grid */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button variant="secondary" className="h-16 bg-yellow-600 hover:bg-yellow-500 text-white" onClick={() => handleAndon('material')}>
                        <AlertTriangle className="mr-2" /> Material
                    </Button>
                    <Button variant="secondary" className="h-16 bg-blue-600 hover:bg-blue-500 text-white" onClick={() => handleAndon('maintenance')}>
                        <AlertTriangle className="mr-2" /> Manutenção
                    </Button>
                    <Button variant="secondary" className="h-16 bg-purple-600 hover:bg-purple-500 text-white" onClick={() => handleAndon('quality')}>
                        <AlertTriangle className="mr-2" /> Qualidade
                    </Button>
                    <Button variant="secondary" className="h-16 bg-orange-600 hover:bg-orange-500 text-white" onClick={() => handleAndon('help')}>
                        <AlertTriangle className="mr-2" /> Ajuda
                    </Button>
                </div>

                {/* ID Input for Reader (Keyboard Wedge Support) */}
                <form onSubmit={handleScan} className="opacity-0 h-0 w-0 overflow-hidden">
                    <input value={scanInput} onChange={e => setScanInput(e.target.value)} autoFocus />
                </form>
            </div>
        </div>
    );
}
