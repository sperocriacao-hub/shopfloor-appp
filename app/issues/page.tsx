"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock, Filter, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { OrderIssue } from "@/types";

export default function IssuesPage() {
    const { orderIssues, resolveIssue, assets, orders } = useShopfloorStore();
    const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

    const filteredIssues = orderIssues.filter(i => {
        if (filter === 'all') return true;
        return i.status === filter;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getStationName = (id: string) => {
        const asset = assets.find(a => a.id === id);
        return asset ? `${asset.name} (${asset.area})` : id;
    };

    const getOrderInfo = (id: string) => {
        const order = orders.find(o => o.id === id);
        return order ? `${order.productModelId} (PO: ${order.po || '-'})` : id;
    };

    const handleResolve = async (issueId: string) => {
        if (confirm("Marcar este problema como resolvido?")) {
            await resolveIssue(issueId, "Gestor"); // TODO: Real user
        }
    };

    const getTypeColor = (type: OrderIssue['type']) => {
        switch (type) {
            case 'blockage': return 'bg-red-100 text-red-800 border-red-200';
            case 'material': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'adjust': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getTypeLabel = (type: OrderIssue['type']) => {
        switch (type) {
            case 'blockage': return 'Bloqueio / Quebra';
            case 'material': return 'Material';
            case 'adjust': return 'Ajuste';
            default: return 'Outros';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900">Gestão de Ocorrências</h1>
                    <p className="text-slate-500">Acompanhamento e resolução de problemas na produção.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'open' ? 'default' : 'outline'}
                        onClick={() => setFilter('open')}
                        className="gap-2"
                    >
                        <AlertTriangle className="h-4 w-4" /> Abertas
                    </Button>
                    <Button
                        variant={filter === 'resolved' ? 'default' : 'outline'}
                        onClick={() => setFilter('resolved')}
                        className="gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Resolvidas
                    </Button>
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="gap-2"
                    >
                        <Archive className="h-4 w-4" /> Todas
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredIssues.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed rounded-lg text-slate-400">
                        Nenhuma ocorrência encontrada com o filtro atual.
                    </div>
                )}
                {filteredIssues.map(issue => (
                    <Card key={issue.id} className={cn(
                        "transition-all",
                        issue.status === 'resolved' ? "opacity-70 bg-slate-50" : "bg-white border-l-4 border-l-red-500 shadow-md"
                    )}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", getTypeColor(issue.type))}>
                                            {getTypeLabel(issue.type)}
                                        </span>
                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(issue.createdAt).toLocaleString()}
                                        </span>
                                        {issue.status === 'resolved' && (
                                            <span className="text-xs font-bold text-green-600 flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" /> Resolvido
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-lg font-medium text-slate-800">{issue.description}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                                        <div>
                                            <span className="font-semibold text-slate-900 block">Estação:</span>
                                            {getStationName(issue.stationId)}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-slate-900 block">Ordem / Produto:</span>
                                            {getOrderInfo(issue.orderId)}
                                        </div>
                                    </div>
                                </div>

                                {issue.status === 'open' && (
                                    <Button
                                        onClick={() => handleResolve(issue.id)}
                                        className="bg-green-600 hover:bg-green-700 shrink-0"
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Marcar Resolvido
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
