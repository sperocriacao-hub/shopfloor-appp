"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Wrench, CheckCircle, AlertTriangle, LayoutDashboard } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ToolDashboard() {
    const { tools, toolMaintenances, toolTransactions, employees } = useShopfloorStore();

    // 1. Tool Status Distribution
    const statusCounts = tools.reduce((acc, tool) => {
        acc[tool.status] = (acc[tool.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusData = [
        { name: 'Disponível', value: statusCounts['available'] || 0, color: '#22c55e' },
        { name: 'Em Uso', value: statusCounts['in_use'] || 0, color: '#3b82f6' },
        { name: 'Manutenção', value: statusCounts['maintenance'] || 0, color: '#f97316' },
        { name: 'Descarte', value: statusCounts['scrapped'] || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // 2. Condition Distribution
    const conditionCounts = tools.reduce((acc, tool) => {
        const cond = tool.condition || 'good';
        acc[cond] = (acc[cond] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const conditionData = [
        { name: 'Nova', value: conditionCounts['new'] || 0 },
        { name: 'Boa', value: conditionCounts['good'] || 0 },
        { name: 'Razoável', value: conditionCounts['fair'] || 0 },
        { name: 'Ruim', value: conditionCounts['poor'] || 0 },
    ];

    // 3. Maintenance Pareto (Top 5 Tools)
    const maintenanceCounts = toolMaintenances.reduce((acc, m) => {
        const tool = tools.find(t => t.id === m.toolId);
        const name = tool ? `${tool.code} - ${tool.name}` : 'Desconhecida';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const paretoData = Object.entries(maintenanceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // 4. Tools by Area & Station (In Use only, as available tools are in Ferramentaria)
    const toolsInUse = tools.filter(t => t.currentHolderId && t.status === 'in_use');

    const areaCounts = toolsInUse.reduce((acc, tool) => {
        const holder = employees.find(e => e.id === tool.currentHolderId);
        if (holder && holder.area) {
            acc[holder.area] = (acc[holder.area] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const areaData = Object.entries(areaCounts).map(([name, value]) => ({ name, value }));

    const stationCounts = toolsInUse.reduce((acc, tool) => {
        const holder = employees.find(e => e.id === tool.currentHolderId);
        if (holder && holder.workstation) {
            acc[holder.workstation] = (acc[holder.workstation] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const stationData = Object.entries(stationCounts).map(([name, value]) => ({ name, value }));

    // 5. Top Employees Sending to Maintenance (Damage)
    // Filter transactions where action is 'maintenance_out' (sending to maintenance)
    // Note: 'maintenance_out' implies the tool came from an employee or was checked out.
    // Ideally, we track who had it last.
    // If 'maintenance_out' is logged, check if it has an employeeId.
    const damageCounts = toolTransactions
        .filter(tx => tx.action === 'maintenance_out' && tx.employeeId)
        .reduce((acc, tx) => {
            const empName = employees.find(e => e.id === tx.employeeId)?.name || "Desconhecido";
            acc[empName] = (acc[empName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const employeeDamageData = Object.entries(damageCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                Visão Geral (KPIs)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Ferramentas</CardTitle>
                        <div className="text-2xl font-bold">{tools.length}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-green-600">Disponíveis</CardTitle>
                        <div className="text-2xl font-bold">{statusCounts['available'] || 0}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-blue-600">Em Uso</CardTitle>
                        <div className="text-2xl font-bold">{statusCounts['in_use'] || 0}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-orange-600">Em Manutenção</CardTitle>
                        <div className="text-2xl font-bold">{statusCounts['maintenance'] || 0}</div>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-[350px]">
                    <CardHeader>
                        <CardTitle>Status do Estoque</CardTitle>
                        <CardDescription>Distribuição atual das ferramentas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-[350px]">
                    <CardHeader>
                        <CardTitle>Ferramentas com + Manutenção</CardTitle>
                        <CardDescription>Top 5 ferramentas que mais quebraram.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {paretoData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paretoData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                        {paretoData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Sem histórico suficiente.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-[350px]">
                    <CardHeader>
                        <CardTitle>Ferramentas por Área (Em Uso)</CardTitle>
                        <CardDescription>Onde as ferramentas estão agora.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={areaData}>
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-[350px]">
                    <CardHeader>
                        <CardTitle>Envios p/ Manutenção por Funcionário</CardTitle>
                        <CardDescription>Quem mais envia ferramentas para conserto.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {employeeDamageData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={employeeDamageData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                Sem dados de danos por funcionário.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Condição das Ferramentas</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={conditionData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
