"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart2, FileText, Printer, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function MaintenanceIntelligencePage() {
    const { maintenanceOrders, moldGeometries, assets } = useShopfloorStore();
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    // KPI Calculations
    const totalCurrentOrders = maintenanceOrders.length;
    const openOrders = maintenanceOrders.filter(o => o.status !== 'verified' && o.status !== 'completed').length;

    // Group pins by position for heatmap logic (simplified)
    const allPins = maintenanceOrders.flatMap(o => o.pins || []);

    // Geometry for visualization
    const currentGeometry = moldGeometries.length > 0 ? moldGeometries[0] : null;

    // Pareto Analysis (Defect Type)
    const defectCounts = allPins.reduce((acc, pin) => {
        acc[pin.type] = (acc[pin.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedDefects = Object.entries(defectCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);

    const handlePrintReport = () => {
        window.print();
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen space-y-8">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart2 className="h-8 w-8 text-primary" />
                        Intelligence & KPIs
                    </h1>
                    <p className="text-slate-500">Análise de preservação de ativos e histórico de falhas.</p>
                </div>
                <Button variant="outline" onClick={handlePrintReport}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimir Relatório
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Intervenções Totais</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalCurrentOrders}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Em Aberto</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{openOrders}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Defeitos Registrados</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{allPins.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">MTBF (Ciclos)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">145</div>
                        <p className="text-xs text-slate-400">Estimado</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
                {/* Heatmap */}
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle>Heatmap de Ocorrências</CardTitle>
                        <CardDescription>Sobreposição histórica de todos os defeitos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full aspect-video bg-slate-200 rounded border border-slate-300 overflow-hidden">
                            {currentGeometry ? (
                                <div className="w-full h-full opacity-50 grayscale" dangerouslySetInnerHTML={{ __html: currentGeometry.svgContent }} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">Sem Geometria</div>
                            )}

                            {/* Heatmap Overlay (All Pins) */}
                            {allPins.map((pin, i) => (
                                <div
                                    key={`heat-${i}`}
                                    className="absolute w-8 h-8 -ml-4 -mt-4 bg-red-600 rounded-full blur-md opacity-30"
                                    style={{ left: `${pin.posX}%`, top: `${pin.posY}%` }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pareto / Listing */}
                <div className="space-y-6 print:break-inside-avoid">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Defeitos (Pareto)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sortedDefects.length === 0 ? <p className="text-slate-500">Sem dados.</p> : sortedDefects.map(([type, count]) => (
                                    <div key={type} className="flex items-center gap-4">
                                        <div className="w-24 capitalize font-medium">{type}</div>
                                        <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded"
                                                style={{ width: `${(count / allPins.length) * 100}%` }}
                                            />
                                        </div>
                                        <div className="w-12 text-right font-bold">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Trail Table component could go here */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimas Intervenções</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {maintenanceOrders.slice(-5).reverse().map(o => (
                                    <div key={o.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                                        <div>
                                            <span className="font-bold">{assets.find(a => a.id === o.assetId)?.name}</span>
                                            <span className="mx-2 text-slate-300">|</span>
                                            <span className="text-slate-600">{o.description}</span>
                                        </div>
                                        <Badge variant="outline">{o.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="hidden print:block text-center text-xs text-slate-400 mt-12 border-t pt-4">
                Relatório de Auditoria de Ativos - Gerado por Antigravity Shopfloor - {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}
