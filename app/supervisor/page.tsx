"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, LayoutDashboard, Anchor, AlertTriangle, MoveRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Employee, Asset } from "@/types";
import { SupervisorDashboardV2 } from "@/components/supervisor/SupervisorDashboardV2";

export default function SupervisorPage() {
    const {
        orders, assets, employees, productionLines,
        updateEmployee, events, resolveAndon // Added resolveAndon
    } = useShopfloorStore();

    // We need to fetch alerts if not exposed directly, but we added 'alerts' to store state previously.
    // Let's assume useShopfloorStore returns alerts.
    const alerts = useShopfloorStore(s => s.alerts) || [];

    const [activeTab, setActiveTab] = useState("tracks");
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

    // --- 1. Track View Logic ---
    const lines = productionLines.length > 0 ? productionLines : [
        { id: 'A', description: 'Linha A - Interceptor', active: true },
        { id: 'B', description: 'Linha B - Fast Patrol', active: true },
        { id: 'C', description: 'Linha C - Rescue', active: true },
        { id: 'D', description: 'Linha D - Custom', active: true },
    ];

    // Helper to get orders by line
    const getOrdersByLine = (lineId: string) => {
        return orders.filter(o => o.productionLineId === lineId && o.status !== 'completed');
    };

    // --- 2. Resource Logic ---
    const employeesByWebStation = employees.filter(e => e.hrStatus === 'active');

    const handleMoveEmployee = async (empId: string, newStationId: string) => {
        // Find asset
        const asset = assets.find(a => a.id === newStationId);
        if (!asset) return;

        await updateEmployee(empId, {
            workstation: asset.name,
            area: asset.area
        });
        toast.success("Operador reatribuído com sucesso!");
        setSelectedEmployee(null);
    };

    // --- 3. BI Logic (Shift Report) ---
    // Calculate simple OEE proxy
    const totalActiveTime = events.filter(e => e.type === 'START').length * 60; // Mock active minutes
    const totalDownTime = events.filter(e => e.type === 'STOP').length * 15; // Mock 15m per stop
    const qualityLoss = 0; // events.filter(e => e.type === 'SCRAP')... 

    const availability = (480 - totalDownTime) / 480; // Assuming 8h shift (480m)
    const activeAlertsCount = alerts.filter(a => a.status === 'open').length;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* V2 DASHBOARD HEADER (Replaces old static header) */}
            <SupervisorDashboardV2 />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 pt-4 border-t">

                <TabsList>
                    <TabsTrigger value="tracks" className="flex gap-2"><LayoutDashboard className="h-4 w-4" /> Pistas (Linhas)</TabsTrigger>
                    <TabsTrigger value="alerts" className="flex gap-2 relative">
                        <AlertTriangle className="h-4 w-4 text-red-500" /> Andon
                        {activeAlertsCount > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex gap-2"><Users className="h-4 w-4" /> Recursos (RH)</TabsTrigger>
                    <TabsTrigger value="bi" className="flex gap-2"><BarChart3 className="h-4 w-4" /> Relatório de Turno</TabsTrigger>
                </TabsList>

                {/* --- TAB: TRACK VIEW --- */}
                <TabsContent value="tracks" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-1">
                        {lines.map(line => (
                            <Card key={line.id} className="border-l-4 border-l-blue-600">
                                <CardHeader className="py-3 bg-slate-50 border-b flex flex-row justify-between items-center">
                                    <CardTitle className="text-base font-bold text-slate-800">{line.description}</CardTitle>
                                    <Badge variant={line.active ? "default" : "secondary"}>{line.active ? "ATIVA" : "INATIVA"}</Badge>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="flex gap-4 overflow-x-auto pb-2 min-h-[120px] items-center">
                                        {getOrdersByLine(line.id).length === 0 ? (
                                            <div className="text-slate-400 text-sm italic w-full text-center">Nenhuma ordem ativa nesta linha.</div>
                                        ) : (
                                            getOrdersByLine(line.id).map(order => (
                                                <div key={order.id} className="min-w-[200px] p-3 bg-white border rounded shadow-sm relative group">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-sm text-blue-900">{order.po || "Sem PO"}</span>
                                                        <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        <Anchor className="h-3 w-3" />
                                                        {order.hin || "N/A"}
                                                    </div>
                                                    <div className="mt-2 text-xs font-medium text-slate-700 truncate">
                                                        {assets.find(a => a.id === order.assetId)?.name || "Estação..."}
                                                    </div>
                                                    {/* Progress Bar Mock */}
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                        <div className="bg-green-500 h-full" style={{ width: '60%' }}></div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {/* Placeholder for "Add" */}
                                        <div className="min-w-[50px] flex items-center justify-center opacity-30 border-2 border-dashed rounded h-[100px]">
                                            <span className="text-2xl">+</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* --- TAB: ALERTS (ANDON) --- */}
                <TabsContent value="alerts" className="space-y-4">
                    <div className="grid gap-4">
                        {alerts.length === 0 ? (
                            <Card className="bg-slate-50 border-dashed border-2">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-slate-400">
                                    <CheckCircle2 className="h-12 w-12 mb-4 text-green-500/50" />
                                    <h3 className="text-lg font-medium">Todos os sistemas operacionais</h3>
                                    <p>Nenhum alerta ativo no momento.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            alerts.filter(a => a.status !== 'resolved').map(alert => (
                                <Card key={alert.id} className="border-l-4 border-l-red-500 shadow-sm animate-in fade-in slide-in-from-left-4">
                                    <CardContent className="p-4 flex flex-row items-center justify-between">
                                        <div className="flex gap-4 items-start">
                                            <div className="bg-red-100 p-3 rounded-full text-red-600">
                                                <AlertTriangle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={alert.type === 'help' ? 'default' : 'destructive'} className="uppercase">
                                                        {alert.type}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500 font-mono">
                                                        {new Date(alert.createdAt).toLocaleTimeString()} (+{Math.floor((new Date().getTime() - new Date(alert.createdAt).getTime()) / 60000)} min)
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg text-slate-800">
                                                    {assets.find(a => a.id === alert.stationId)?.name || "Estação Desconhecida"}
                                                </h3>
                                                <p className="text-slate-600">{alert.description || "Sem descrição"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => toast.info("Notificação reenviada ao Líder!")}>
                                                Escalar
                                            </Button>
                                            <Button
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => {
                                                    resolveAndon(alert.id, "Supervisor");
                                                    toast.success("Alerta resolvido");
                                                }}
                                            >
                                                Resolver
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}

                        {/* History (Closed) */}
                        {alerts.filter(a => a.status === 'resolved').length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Histórico Recente</h3>
                                <div className="space-y-2 opacity-60">
                                    {alerts.filter(a => a.status === 'resolved').slice(0, 5).map(alert => (
                                        <div key={alert.id} className="flex justify-between items-center bg-slate-50 p-3 rounded border">
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="secondary" className="scale-75">{alert.type}</Badge>
                                                <span className="text-sm font-medium">{assets.find(a => a.id === alert.stationId)?.name}</span>
                                                <span className="text-xs text-slate-400">Resolvido por {alert.resolvedBy}</span>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">{new Date(alert.resolvedAt!).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="resources" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* List of Employees */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-semibold text-slate-800">Equipe Presente</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {employeesByWebStation.map(emp => (
                                    <div
                                        key={emp.id}
                                        className={`p-3 border rounded cursor-pointer transition-all hover:border-blue-300 ${selectedEmployee === emp.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}`}
                                        onClick={() => setSelectedEmployee(emp.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                                                {emp.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium text-sm truncate">{emp.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{emp.workstation || "Sem Posto"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reassignment Zone (appears when selected) */}
                        <div className="md:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader className="bg-slate-50 border-b py-3">
                                    <CardTitle className="text-sm font-bold">Reatribuir Operador</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {selectedEmployee ? (
                                        <>
                                            <div className="text-sm">
                                                Operador: <span className="font-bold text-blue-700">{employees.find(e => e.id === selectedEmployee)?.name}</span>
                                            </div>
                                            <div className="text-xs text-slate-500">Selecione o novo posto de trabalho:</div>

                                            <div className="max-h-[400px] overflow-y-auto space-y-1">
                                                {assets.filter(a => a.type === 'Workstation' || a.type === 'Machine').map(asset => (
                                                    <Button
                                                        key={asset.id}
                                                        variant="ghost"
                                                        className="w-full justify-start text-xs h-8"
                                                        onClick={() => handleMoveEmployee(selectedEmployee, asset.id)}
                                                    >
                                                        <MoveRight className="h-3 w-3 mr-2 text-slate-400" />
                                                        {asset.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-slate-400 py-10 text-sm">
                                            Selecione um funcionário ao lado para movê-lo.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: BI REPORT --- */}
                <TabsContent value="bi" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">OEE (Estimado)</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{Math.round(availability * 100)}%</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Perda Financeira (Turno)</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold text-red-600">€ {totalDownTime * 50}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Takt Time</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">45 min</div></CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pareto de Paradas</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center border-t">
                            <p className="text-slate-400">Gráfico de paradas (Simulado)</p>
                            {/* Future: Integrade Recharts here */}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
