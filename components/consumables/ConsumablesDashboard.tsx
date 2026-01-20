"use client";

import { useState, useMemo } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { DollarSign, Filter, TrendingUp } from "lucide-react";
import { format, subMonths, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, parse } from "date-fns";
import { pt } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ConsumablesDashboard() {
    const { consumableTransactions, assets } = useShopfloorStore();

    // Calculate unique months available in data
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        consumableTransactions.forEach(tx => {
            if (!tx.date) return;
            try {
                // Ensure date is handled correctly. If string is YYYY-MM-DD
                const d = parseISO(tx.date);
                months.add(format(d, 'yyyy-MM'));
            } catch (e) {
                console.warn("Invalid date in transaction:", tx.date);
            }
        });
        return Array.from(months).sort().reverse(); // Descending order
    }, [consumableTransactions]);

    // Default to current month or latest available
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const current = format(new Date(), 'yyyy-MM');
        if (availableMonths.includes(current)) return current;
        return availableMonths[0] || current; // Fallback to first available or current
    });

    // Filter transactions for the selected month
    const monthlyTransactions = useMemo(() => {
        return consumableTransactions.filter(tx => {
            if (!tx.date) return false;
            return tx.date.startsWith(selectedMonth);
        });
    }, [consumableTransactions, selectedMonth]);

    // 1. Total Cost by Line (INT, PCS, PPI, PST) for Selected Month
    const costByLine = useMemo(() => {
        return monthlyTransactions.reduce((acc, tx) => {
            acc[tx.prodLine] = (acc[tx.prodLine] || 0) + tx.extensionCost;
            return acc;
        }, {} as Record<string, number>);
    }, [monthlyTransactions]);

    const lineData = Object.entries(costByLine).map(([name, value]) => ({ name, value }));

    // 2. Top 10 Cost Centers for Selected Month
    const costByAsset = useMemo(() => {
        return monthlyTransactions.reduce((acc, tx) => {
            if (tx.mappedAssetId) {
                const assetName = assets.find(a => a.id === tx.mappedAssetId)?.name || "Desconhecido";
                acc[assetName] = (acc[assetName] || 0) + tx.extensionCost;
            } else {
                const label = `CC: ${tx.customerCode}`;
                acc[label] = (acc[label] || 0) + tx.extensionCost;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [monthlyTransactions, assets]);

    const assetData = useMemo(() => {
        return Object.entries(costByAsset)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [costByAsset]);

    const totalCost = monthlyTransactions.reduce((sum, tx) => sum + tx.extensionCost, 0);

    // 3. Trend Data (Last 6 Months up to Selected Month)
    const trendData = useMemo(() => {
        if (!selectedMonth) return [];

        const referenceDate = parse(selectedMonth, 'yyyy-MM', new Date());
        // Generate last 6 months
        const months = [];
        for (let i = 5; i >= 0; i--) {
            months.push(subMonths(referenceDate, i));
        }

        return months.map(date => {
            const monthKey = format(date, 'yyyy-MM');
            const monthLabel = format(date, 'MMM/yy', { locale: pt });

            // Calc stats for this month
            const txs = consumableTransactions.filter(tx => tx.date && tx.date.startsWith(monthKey));

            const stats = txs.reduce((acc, tx) => {
                acc.total += tx.extensionCost;
                acc[tx.prodLine] = (acc[tx.prodLine] || 0) + tx.extensionCost;
                return acc;
            }, { total: 0 } as Record<string, number>);

            return {
                name: monthLabel,
                total: stats.total,
                INT: stats['INT'] || 0,
                PCS: stats['PCS'] || 0,
                PPI: stats['PPI'] || 0,
                PST: stats['PST'] || 0,
            };
        });
    }, [selectedMonth, consumableTransactions]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    KPIs de Custos
                </h2>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Selecione o Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map(month => (
                                <SelectItem key={month} value={month}>
                                    {format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: pt })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-500">Custo Total (Mês)</CardTitle>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolution Chart */}
                <Card className="h-[400px] lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Evolução de Custos (6 Meses)
                        </CardTitle>
                        <CardDescription>Tendência de gastos acumulados por categoria.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: any) => `€ ${Number(value).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`}
                                    labelStyle={{ color: 'black' }}
                                />
                                <Legend />
                                <Bar dataKey="INT" stackId="a" fill="#0088FE" name="Material BOM" />
                                <Bar dataKey="PCS" stackId="a" fill="#FFBB28" name="Consumíveis" />
                                <Bar dataKey="PPI" stackId="a" fill="#8884d8" name="EPIs" />
                                <Bar dataKey="PST" stackId="a" fill="#FF8042" name="Ferramentas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Custo por Tipo ({format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMM/yy', { locale: pt })})</CardTitle>
                        <CardDescription>Distribuição de gastos neste mês.</CardDescription>
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
                                <Tooltip formatter={(value: any) => `€ ${Number(value).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Top Centros de Custo</CardTitle>
                        <CardDescription>Áreas com maior consumo neste mês.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assetData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value: any) => `€ ${Number(value).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
