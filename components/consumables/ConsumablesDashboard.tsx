"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ConsumablesDashboard() {
    const { consumableTransactions, costCenterMappings, assets } = useShopfloorStore();

    // 1. Total Cost by Line (INT, PCS, PPI, PST)
    const costByLine = consumableTransactions.reduce((acc, tx) => {
        acc[tx.prodLine] = (acc[tx.prodLine] || 0) + tx.extensionCost;
        return acc;
    }, {} as Record<string, number>);

    const lineData = Object.entries(costByLine).map(([name, value]) => ({ name, value }));

    // 2. Top 5 Cost Centers (Mapped Assets)
    const costByAsset = consumableTransactions.reduce((acc, tx) => {
        if (tx.mappedAssetId) {
            const assetName = assets.find(a => a.id === tx.mappedAssetId)?.name || "Desconhecido";
            acc[assetName] = (acc[assetName] || 0) + tx.extensionCost;
        } else {
            const label = `CC: ${tx.customerCode}`;
            acc[label] = (acc[label] || 0) + tx.extensionCost;
        }
        return acc;
    }, {} as Record<string, number>);

    const assetData = Object.entries(costByAsset)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const totalCost = consumableTransactions.reduce((sum, tx) => sum + tx.extensionCost, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                KPIs de Custos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-500">Custo Total (Importado)</CardTitle>
                        <div className="text-2xl font-bold">€ {totalCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-blue-600">Material BOM (INT)</CardTitle>
                        <div className="text-2xl font-bold">€ {(costByLine['INT'] || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-orange-600">Consumíveis (PCS)</CardTitle>
                        <div className="text-2xl font-bold">€ {(costByLine['PCS'] || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-purple-600">EPIs (PPI)</CardTitle>
                        <div className="text-2xl font-bold">€ {(costByLine['PPI'] || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</div>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Custo por Tipo</CardTitle>
                        <CardDescription>Distribuição de gastos por linha de produto.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={lineData}
                                    cx="50%"
                                    cy="50%"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {lineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `€ ${value.toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Top 10 Centros de Custo</CardTitle>
                        <CardDescription>Áreas com maior consumo acumulado.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assetData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value: number) => `€ ${value.toFixed(2)}`} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
