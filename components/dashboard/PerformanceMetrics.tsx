"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, ProductionEvent, ProductionOrder } from "@/types";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceMetricsProps {
    events: ProductionEvent[];
    assets: Asset[];
    orders: ProductionOrder[];
}

export function PerformanceMetrics({ events, assets, orders }: PerformanceMetricsProps) {
    // 1. Calculate Completed Cycles (START -> STOP/COMPLETE pairs)
    const completedCycles = events.filter(e => e.type === 'STOP' || e.type === 'COMPLETE').map(endEvent => {
        // Find corresponding start
        // Limit search to same asset and order, looking for latest START before this END
        const startEvent = events
            .filter(e => e.type === 'START' && e.assetId === endEvent.assetId && e.orderId === endEvent.orderId && new Date(e.timestamp) < new Date(endEvent.timestamp))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        if (!startEvent) return null;

        const durationMs = new Date(endEvent.timestamp).getTime() - new Date(startEvent.timestamp).getTime();
        const durationMinutes = durationMs / 1000 / 60;

        const asset = assets.find(a => a.id === endEvent.assetId);
        const targetMinutes = asset?.defaultCycleTime || 60; // Default fallback

        return {
            assetName: asset?.name || 'Unknown',
            durationMinutes,
            targetMinutes,
            efficiency: (targetMinutes / (durationMinutes || 1)) * 100, // Avoid div by zero
            timestamp: endEvent.timestamp
        };
    }).filter(Boolean); // Remove nulls

    // 2. Aggregate by Asset (Last 5 cycles avg)
    const assetPerformance: Record<string, { totalEff: number, count: number, name: string }> = {};
    
    completedCycles?.forEach(cycle => {
        if (!cycle) return;
        if (!assetPerformance[cycle.assetName]) {
            assetPerformance[cycle.assetName] = { totalEff: 0, count: 0, name: cycle.assetName };
        }
        assetPerformance[cycle.assetName].totalEff += cycle.efficiency;
        assetPerformance[cycle.assetName].count += 1;
    });

    const metrics = Object.values(assetPerformance).map(ap => ({
        name: ap.name,
        avgEfficiency: ap.totalEff / ap.count
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency).slice(0, 5); // Top 5

    // Global Average
    const globalEfficiency = metrics.length > 0 
        ? metrics.reduce((acc, curr) => acc + curr.avgEfficiency, 0) / metrics.length 
        : 0;

    return (
        <Card className="col-span-4 lg:col-span-3">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Performance de Ciclo (Real vs Padrão)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {metrics.length === 0 && (
                        <p className="text-center text-slate-400 py-6">Dados insuficientes para cálculo de OEE.</p>
                    )}

                    {metrics.map((m, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">{m.name}</span>
                                <span className={m.avgEfficiency >= 100 ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                                    {m.avgEfficiency.toFixed(1)}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${m.avgEfficiency >= 100 ? 'bg-green-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${Math.min(m.avgEfficiency, 100)}%` }} // Cap visual at 100% for bar, but show real number
                                />
                            </div>
                        </div>
                    ))}
                    
                    {metrics.length > 0 && (
                        <div className="pt-4 mt-4 border-t flex justify-between items-center">
                            <span className="text-sm text-slate-500">Média Global do Turno</span>
                            <div className="flex items-center gap-2">
                                {globalEfficiency >= 90 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                                <span className="text-xl font-bold text-slate-800">{globalEfficiency.toFixed(1)}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
