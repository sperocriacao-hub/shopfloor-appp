"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Play, Pause, Square, CheckCircle, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderCockpitPage() {
    const params = useParams();
    const router = useRouter();
    const { orders, products, routings, assets } = useShopfloorStore();

    // Hooks must be unconditional
    const [isRunning, setIsRunning] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);

    // Mock Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const order = orders.find(o => o.id === params.id);
    const product = products.find(p => p.id === order?.productModelId);

    // Safe derivation of ops
    const activeOps = order?.activeOperations ?? routings.find(r => r.productModelId === product?.id)?.operations ?? [];

    if (!order || !product) return <div className="p-8">Ordem não encontrada</div>;

    const currentOp = activeOps.find(op => op.id === order.currentOperationId) || activeOps[0];
    const assignedAsset = assets.find(a => a.type === currentOp?.requiredAssetType && a.status !== 'breakdown');

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-blue-900">Cockpit do Operador</h1>
                    <p className="text-sm text-slate-500">Ordem #{order.id} • {product.name}</p>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Ativo Alocado</p>
                        <p className="font-bold text-blue-800">{assignedAsset?.name || 'Aguardando Alocação'}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Status</p>
                        <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold",
                            isRunning ? "bg-green-100 text-green-700 animate-pulse" : "bg-yellow-100 text-yellow-700"
                        )}>
                            {isRunning ? 'EM PRODUÇÃO' : 'PARADO'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Action Area */}
                <Card className="lg:col-span-2 border-blue-200">
                    <CardHeader className="bg-blue-50 border-b">
                        <CardTitle className="text-blue-900 flex items-center">
                            <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                            Operação Atual: {currentOp?.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">

                        <div className="text-6xl font-mono font-bold text-slate-700">
                            {formatTime(sessionTime)}
                        </div>

                        <div className="flex items-center justify-center space-x-6 w-full">
                            {!isRunning ? (
                                <Button
                                    className="h-24 w-24 rounded-full bg-green-600 hover:bg-green-700 shadow-xl border-4 border-green-100"
                                    onClick={() => setIsRunning(true)}
                                >
                                    <Play className="h-10 w-10 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    className="h-24 w-24 rounded-full bg-yellow-500 hover:bg-yellow-600 shadow-xl border-4 border-yellow-100"
                                    onClick={() => setIsRunning(false)}
                                >
                                    <Pause className="h-10 w-10" />
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-16 w-16 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                                title="Finalizar Turno/Tarefa"
                            >
                                <Square className="h-6 w-6" />
                            </Button>
                        </div>

                        <p className="text-sm text-slate-400">
                            {isRunning ? 'Capturando dados de OEE...' : 'Pressione PLAY para iniciar o apontamento.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Context/Instructions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Metas e OEE</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Tempo Padrão</span>
                                <span className="font-bold">{currentOp?.standardTimeMinutes} min</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Eficiência Esp.</span>
                                <span className="font-bold text-green-600">95%</span>
                            </div>
                            <div className="pt-4 border-t">
                                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Reportar Parada
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Próximas Etapas</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activeOps.filter(op => op.sequence > (currentOp?.sequence || 0)).map((op) => (
                                    <div key={op.id} className="flex items-center text-sm text-slate-400">
                                        <span className="w-6 font-mono text-xs">{op.sequence}</span>
                                        <span>{op.name}</span>
                                    </div>
                                ))}
                                {activeOps.filter(op => op.sequence > (currentOp?.sequence || 0)).length === 0 && (
                                    <div className="text-xs text-green-600 font-medium">Última etapa!</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
