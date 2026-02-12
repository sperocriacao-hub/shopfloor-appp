"use client";

import React from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function TopThreeRanking() {
    const { leanAudits } = useShopfloorStore();

    const areaStats: Record<string, { totalScore: number; count: number }> = {};

    leanAudits.forEach(audit => {
        if (!areaStats[audit.area]) {
            areaStats[audit.area] = { totalScore: 0, count: 0 };
        }
        const pct = audit.maxScore > 0 ? (audit.score / audit.maxScore) * 100 : 0;
        areaStats[audit.area].totalScore += pct;
        areaStats[audit.area].count += 1;
    });

    const ranking = Object.entries(areaStats).map(([area, stats]) => ({
        area,
        avgScore: Math.round(stats.totalScore / stats.count)
    }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 3);

    return (
        <Card className="h-full bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-yellow-700 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" /> Top 3 Áreas (5S)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {ranking.map((item, index) => (
                        <div key={item.area} className="flex items-center gap-3">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border
                                ${index === 0 ? 'bg-yellow-400 text-yellow-900 border-yellow-500' :
                                    index === 1 ? 'bg-slate-300 text-slate-800 border-slate-400' :
                                        'bg-amber-700 text-amber-100 border-amber-800'}
                            `}>
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-800">{item.area}</div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${index === 0 ? 'bg-yellow-500' : 'bg-slate-500'}`}
                                        style={{ width: `${item.avgScore}%` }}
                                    />
                                </div>
                            </div>
                            <div className="font-bold text-slate-700">{item.avgScore}%</div>
                        </div>
                    ))}
                    {ranking.length === 0 && <p className="text-xs text-slate-400">Nenhum dado disponível.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
