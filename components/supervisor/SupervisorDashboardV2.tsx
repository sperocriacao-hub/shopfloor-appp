"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, Battery, AlertTriangle, Clock, ArrowRight, Activity, CalendarDays, Zap } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function SupervisorDashboardV2() {
    const { currentUser, orders, assets, alerts } = useShopfloorStore();
    const router = useRouter();

    // --- Logic: Critical Flows (Bottlenecks) ---
    // Mock logic: Find orders that are "in_progress" for more than 4 hours (simulated)
    const criticalOrders = orders.filter(o =>
        o.status === 'in_progress' &&
        (new Date().getHours() % 3 === 0) // Randomly flag some orders for demo based on time
    ).slice(0, 3); // Take top 3

    // --- Logic: Asset Forecast ---
    const moldAssets = assets.filter(a => a.type === 'Mold');
    const availableMolds = moldAssets.filter(a => a.status === 'available').length;
    const totalMolds = moldAssets.length;
    const availabilityPercentage = totalMolds > 0 ? (availableMolds / totalMolds) * 100 : 0;

    // --- Realtime Pulse Logic ---
    const [hasMaterialAlert, setHasMaterialAlert] = useState(false);

    useEffect(() => {
        const materialAlerts = alerts.filter(a => a.type === 'material' && a.status === 'open');
        setHasMaterialAlert(materialAlerts.length > 0);
    }, [alerts]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {new Date().getHours() < 12 ? "Bom dia" : "Boa tarde"}, {currentUser?.name?.split(' ')[0] || "Supervisor"}!
                    </h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(), "EEEE, d 'de' MMMM", { locale: pt })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => toast.info("Relatório PDF a ser gerado...")}>
                        <Activity className="h-4 w-4" /> Relatório de Ontem
                    </Button>
                    <Button className="gap-2 bg-blue-700 hover:bg-blue-600">
                        <CalendarDays className="h-4 w-4" /> Agenda de Moldes
                    </Button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                {/* Battery Alert Widget (Mock) */}
                <Card className="bg-slate-50 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Bateria de Tablets</CardTitle>
                        <Battery className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">1 Crítico</div>
                        <p className="text-xs text-orange-600 font-medium mt-1">Estação de Laminação (8%)</p>
                    </CardContent>
                </Card>

                {/* Availability Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Disponibilidade de Moldes (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(availabilityPercentage)}%</div>
                        <Progress value={availabilityPercentage} className="h-2 mt-2" />
                        <p className="text-xs text-slate-500 mt-2">{availableMolds} de {totalMolds} moldes livres</p>
                    </CardContent>
                </Card>

                {/* Efficiency Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">OEE Linha Interceptor</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">87%</div>
                        <p className="text-xs text-green-600 font-medium mt-1">↑ 2% vs semana passada</p>
                    </CardContent>
                </Card>

                {/* Staff Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Equipa Presente</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24 / 28</div>
                        <p className="text-xs text-slate-500 mt-1">4 Ausências (1 Planeada)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Management by Exception Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Critical Flows (Bottlenecks) */}
                <Card className="lg:col-span-2 border-l-4 border-l-red-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-red-500" />
                            Fluxos Críticos (Gargalos)
                        </CardTitle>
                        <CardDescription>Ordens paradas há mais de 1 hora na mesma operação.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {criticalOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                                <p>Tudo fluindo normal! Bom trabalho.</p>
                            </div>
                        ) : (
                            criticalOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-xs uppercase w-12 text-center">
                                            {order.productionLineId || 'LINHA'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{order.po} - {order.productModelId}</h4>
                                            <p className="text-sm text-slate-500">
                                                Estação: <span className="font-medium text-slate-700">{assets.find(a => a.id === order.assetId)?.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-red-600 font-bold text-sm flex items-center gap-1 justify-end">
                                            <AlertTriangle className="h-3 w-3" />
                                            +4h Atraso
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs mt-1 text-blue-600 hover:text-blue-800">
                                            Ver Detalhes <ArrowRight className="h-3 w-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Mock Item if empty for review */}
                        {criticalOrders.length === 0 && (
                            <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm w-full opacity-60 grayscale">
                                <p className="text-xs text-center w-full">Simulação: Nenhum gargalo real detectado agora.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Real-time Notifications */}
                <Card className={`border-l-4 ${hasMaterialAlert ? 'border-l-red-500 animate-pulse-gentle ring-2 ring-red-100' : 'border-l-slate-300'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className={`h-5 w-5 ${hasMaterialAlert ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                            Notificações em Tempo Real
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {alerts.filter(a => a.status === 'open').length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhuma notificação ativa.</p>
                        ) : (
                            alerts.filter(a => a.status === 'open').map(alert => (
                                <div key={alert.id} className="p-3 bg-slate-50 rounded border text-sm relative overflow-hidden">
                                    {alert.type === 'material' && (
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge variant={alert.type === 'material' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                                            {alert.type}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400">Agora</span>
                                    </div>
                                    <p className="font-medium text-slate-800">{assets.find(a => a.id === alert.stationId)?.name}</p>
                                    <p className="text-slate-600 text-xs mt-1">{alert.description || "Solicitação de apoio urgente"}</p>
                                </div>
                            ))
                        )}
                    </CardContent>
                    <CardFooter className="pt-2 border-t bg-slate-50/50">
                        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/admin/notifications')}>
                            Ver Histórico
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
import { Users, CheckCircle2 } from "lucide-react"; // Late import fix
