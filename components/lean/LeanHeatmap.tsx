"use client";

import React from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LeanHeatmap() {
    const { leanAudits } = useShopfloorStore();

    // 1. Group audits by Area and calculate average score %
    const areaStats: Record<string, { totalScore: number; count: number }> = {};

    leanAudits.forEach(audit => {
        if (!areaStats[audit.area]) {
            areaStats[audit.area] = { totalScore: 0, count: 0 };
        }
        // Normalize score to percentage (score / maxScore)
        const pct = audit.maxScore > 0 ? (audit.score / audit.maxScore) * 100 : 0;
        areaStats[audit.area].totalScore += pct;
        areaStats[audit.area].count += 1;
    });

    const heatmapData = Object.entries(areaStats).map(([area, stats]) => ({
        area,
        avgScore: Math.round(stats.totalScore / stats.count)
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Color logic
    const getColor = (score: number) => {
        if (score >= 90) return 'bg-green-500 text-white';
        if (score >= 70) return 'bg-amber-400 text-amber-900';
        return 'bg-red-500 text-white';
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Mapa de Calor 5S (Por Área)</CardTitle>
            </CardHeader>
            <CardContent>
                {heatmapData.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">Sem dados suficientes.</div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {heatmapData.map(item => (
                            <div
                                key={item.area}
                                className={`flex flex-col justify-center items-center p-3 rounded-lg shadow-sm ${getColor(item.avgScore)}`}
                            >
                                <span className="text-xs font-bold uppercase truncate max-w-full">{item.area}</span>
                                <span className="text-2xl font-bold">{item.avgScore}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
