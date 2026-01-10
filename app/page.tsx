"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, AlertTriangle, Activity, TrendingUp, Calendar, Anchor } from 'lucide-react';
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function Home() {
  const { assets, employees, orders, events } = useShopfloorStore();
  const [activeTab, setActiveTab] = useState('overview');

  // --- KPI Calculations ---

  // 1. Absenteeism
  const presentEmployees = employees.filter(e => e.hrStatus === 'active').length;
  const totalEmployees = employees.length || 1;
  const attendanceRate = Math.round((presentEmployees / totalEmployees) * 100);

  // 2. Orders in Process
  const activeOrders = orders.filter(o => o.status === 'in_progress');

  // 3. Alerts (Stoppages)
  const activeAlerts = events.filter(e => e.type === 'STOP');

  // --- Chart Data Preparation ---

  // Chart 1: Issues per Station (Mocked + Real aggregation)
  const stationIssuesMap = new Map<string, number>();
  assets.forEach(a => stationIssuesMap.set(a.name, 0));
  events.filter(e => e.type === 'STOP').forEach(e => {
    const asset = assets.find(a => a.id === e.assetId);
    if (asset) {
      const count = stationIssuesMap.get(asset.name) || 0;
      stationIssuesMap.set(asset.name, count + 1);
    }
  });
  const issuesData = Array.from(stationIssuesMap.entries())
    .map(([name, count]) => ({ name, count }))
    .filter(i => i.count > 0 || Math.random() > 0.5) // Filter or keep some for demo
    .sort((a, b) => b.count - a.count);

  if (issuesData.length === 0) {
    // Seed some demo data if empty so user sees the chart
    issuesData.push({ name: 'Lamination', count: 4 });
    issuesData.push({ name: 'Assembly', count: 2 });
    issuesData.push({ name: 'Painting', count: 1 });
  }

  // Chart 2: Daily Production (30 Days)
  const productionData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      orders: Math.floor(Math.random() * 5) + 1, // Mock
      efficiency: 85 + Math.floor(Math.random() * 10)
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500">Visão integrada de produção e qualidade.</p>
        </div>
        <div className="text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded border">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ordens Ativas</CardTitle>
            <Anchor className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{activeOrders.length}</div>
            <p className="text-xs text-slate-400">Em produção no estaleiro</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Presença (RH)</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{attendanceRate}%</div>
            <div className="flex gap-2 text-xs mt-1">
              <span className="text-green-600 font-medium">{presentEmployees} Presentes</span>
              <span className="text-slate-300">|</span>
              <span className="text-red-400">{totalEmployees - presentEmployees} Ausentes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{activeAlerts.length}</div>
            <p className="text-xs text-slate-400">Paradas não resolvidas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Eficiência Média</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">87%</div>
            <p className="text-xs text-green-600 font-bold flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +2.5% vs Mês Anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">

        {/* Main Chart Area */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendência de Produção (30 Dias)</CardTitle>
            <CardDescription>Ordens concluídas e eficiência diária.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" name="Ordens" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Eficiência %" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues List & Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Intercorrências por Estação</CardTitle>
            <CardDescription>Onde estão os gargalos?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuesData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Últimos Alertas</h4>
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-2">Sem alertas ativos. Operação normal.</p>
              ) : (
                activeAlerts.slice(0, 3).map(alert => {
                  const order = undefined; // Order link missing in Event type
                  // const order = orders.find(o => o.id === alert.productionOrderId);
                  const asset = assets.find(a => a.id === alert.assetId);
                  return (
                    <div key={alert.id} className="flex gap-3 items-start p-2 bg-red-50 rounded border border-red-100">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-800">{alert.reason}</p>
                        <p className="text-xs text-red-600">
                          {asset?.name} • Geral
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table (Optional, can be added later) */}
    </div>
  );
}
