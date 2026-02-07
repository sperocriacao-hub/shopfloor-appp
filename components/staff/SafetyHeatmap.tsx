"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function SafetyHeatmap() {
    const { employees, safetyIncidents, safetyInspections } = useShopfloorStore();

    // 1. Get unique areas
    const areas = Array.from(new Set(employees.map(e => e.area).filter(Boolean))).sort();

    // 2. Map status for each area
    const areaStatus = areas.map(area => {
        const incidents = safetyIncidents.filter(i => i.area === area && i.status !== 'closed');
        const critical = incidents.some(i => i.severity === 'critical' || i.severity === 'high');
        const inspection = safetyInspections
            .filter(i => i.area === area)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        let status: 'safe' | 'warning' | 'danger' = 'safe';
        if (critical) status = 'danger';
        else if (incidents.length > 0) status = 'warning';

        return {
            name: area,
            status,
            incidentsCount: incidents.length,
            lastInspection: inspection ? new Date(inspection.date).toLocaleDateString() : 'N/A',
            score: inspection?.overallScore || 0
        };
    });

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Mapa de Risco (Plant Status)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {areaStatus.map((area) => (
                        <div
                            key={area.name}
                            className={`
                                relative p-4 rounded-xl border flex flex-col justify-between h-32 transition-all hover:shadow-md
                                ${area.status === 'safe' ? 'bg-green-50/50 border-green-200' : ''}
                                ${area.status === 'warning' ? 'bg-yellow-50/50 border-yellow-200' : ''}
                                ${area.status === 'danger' ? 'bg-red-50/50 border-red-200' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-slate-700 truncate" title={area.name}>{area.name}</span>
                                {area.status === 'safe' && <ShieldCheck className="h-5 w-5 text-green-500" />}
                                {area.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                                {area.status === 'danger' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            </div>

                            <div className="space-y-1">
                                {area.incidentsCount > 0 && (
                                    <Badge variant={area.status === 'danger' ? 'destructive' : 'secondary'} className="text-[10px]">
                                        {area.incidentsCount} Incidentes
                                    </Badge>
                                )}
                                {area.incidentsCount === 0 && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Zero Acidentes
                                    </span>
                                )}
                                <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                                    Inspeção: {area.lastInspection} {area.score > 0 && `(${area.score.toFixed(0)}%)`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
