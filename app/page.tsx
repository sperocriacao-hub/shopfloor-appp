"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from "react";
import { Asset, ProductionEvent } from "@/types";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";

export default function Home() {
  const { assets, employees, orders, events } = useShopfloorStore();
  const [stats, setStats] = useState({
    activeAreas: 0,
    operators: 0,
    inProgressOrders: 0,
    efficiency: 'Calculating...'
  });

  useEffect(() => {
    // Calculate dynamic stats
    const activeAreasCount = new Set(assets.map(a => a.area)).size;
    const activeOperatorsCount = employees.filter(e => e.hrStatus === 'active').length;
    const inProgressCount = orders.filter(o => o.status === 'in_progress').length;

    // Efficiency Placeholder (Logic can be complex)
    setStats({
      activeAreas: activeAreasCount,
      activeOperators: activeOperatorsCount,
      inProgressOrders: inProgressCount,
      // Efficiency is now calculated in the sub-component
    });
  }, [assets, employees, orders, events]);

  // Derived Data for KPIs
  const activeStations = assets
    .filter(a => a.status === 'in_use')
    .map(a => {
      // Find active event
      const evt = events.find(e => e.assetId === a.id && e.type === 'START');
      return {
        name: a.name,
        startTime: evt ? new Date(evt.timestamp) : new Date(),
        subarea: a.subarea
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visão geral do chão de fábrica.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas Ativas</CardTitle>
            <Boxes className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAreas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadores</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOperators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressOrders}</div>
          </CardContent>
        </Card>

        {/* Efficiency Card removed, moved to detailed chart */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PerformanceMetrics events={events} assets={assets} orders={orders} />

        <Card className="col-span-4 lg:col-span-4">
          <CardHeader>
            <CardTitle>Histórico Recente de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {events.slice().reverse().slice(0, 5).map(evt => {
                const assetName = assets.find(a => a.id === evt.assetId)?.name || 'Desconhecido';
                const typeMap = { 'START': 'Iniciou', 'STOP': 'Parou', 'PAUSE': 'Pausou', 'RESUME': 'Retomou', 'COMPLETE': 'Concluiu' };
                return (
                  <li key={evt.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">
                        {assetName} - <span className={evt.type === 'START' ? 'text-green-600' : 'text-red-600'}>{typeMap[evt.type] || evt.type}</span>
                      </p>
                      <p className="text-xs text-slate-500">{new Date(evt.timestamp).toLocaleString()}</p>
                    </div>
                    {evt.reason && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">{evt.reason}</span>}
                  </li>
                );
              })}
              {events.length === 0 && <p className="text-slate-400 text-sm py-4">Nenhum evento registrado ainda.</p>}
            </ul>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estações em Operação ({activeStations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeStations.length === 0 && <p className="text-slate-400">Nenhuma estação ativa no momento.</p>}
              {activeStations.map((station, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-pulse">
                    <ActivityIcon />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{station.name}</p>
                    <p className="text-xs text-muted-foreground">{station.subarea}</p>
                  </div>
                  <div className="ml-auto font-medium text-green-600">On</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg
      className=" h-4 w-4"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
