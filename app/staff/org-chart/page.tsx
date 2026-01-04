
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, ChevronDown, ChevronRight, User } from "lucide-react";
import { Employee } from "@/types";

export default function OrgChartPage() {
    const router = useRouter();
    const { employees } = useShopfloorStore();
    const activeEmployees = employees.filter(e => e.hrStatus === 'active');

    // Build Hierarchy Tree
    const hierarchy = useMemo(() => {
        const tree: Record<string, Record<string, Record<string, Employee[]>>> = {};

        activeEmployees.forEach(emp => {
            const manager = emp.manager ? emp.manager.trim() : "Sem Gestor";
            const supervisor = emp.supervisor ? emp.supervisor.trim() : "Sem Supervisor";
            const leader = emp.leader ? emp.leader.trim() : "Sem Líder";

            if (!tree[manager]) tree[manager] = {};
            if (!tree[manager][supervisor]) tree[manager][supervisor] = {};
            if (!tree[manager][supervisor][leader]) tree[manager][supervisor][leader] = [];

            tree[manager][supervisor][leader].push(emp);
        });

        return tree;
    }, [activeEmployees]);

    // Simple recursive-like render components
    const NodeCard = ({ title, count, colorClass, icon: Icon, children }: any) => (
        <div className="flex flex-col items-center">
            <div className={`
                relative z-10 flex flex-col items-center justify-center 
                w-48 p-3 rounded-xl shadow-md border-2 
                transition-all hover:scale-105 bg-white
                ${colorClass}
            `}>
                <div className="mb-1 p-2 rounded-full bg-white/20">
                    <Icon className="w-5 h-5 text-current" />
                </div>
                <h3 className="text-sm font-bold text-center leading-tight">{title}</h3>
                <span className="text-[10px] uppercase font-semibold opacity-80 mt-1">{count} Pessoas</span>
            </div>
            {children && (
                <div className="relative flex flex-col items-center mt-4 w-full">
                    {/* Vertical connector from parent to children row */}
                    <div className="h-6 w-px bg-slate-300 absolute -top-4 left-1/2 -translate-x-1/2"></div>

                    {/* Children Container */}
                    <div className="flex flex-wrap justify-center gap-8 pt-4 border-t border-slate-300 relative">
                        {/* This border-t serves as the horizontal connector line. 
                             We need to hide the ends of the line if there's only one child, 
                             or strictly size it. 
                             CSS-only trees are tricky. Let's try a simpler 'Folder' view if this gets messy, 
                             but user asked for Chart. Let's try to make it look tree-ish.
                         */}
                        {children}
                    </div>
                </div>
            )}
        </div>
    );

    // Tree Rendering Logic
    // Since full flex tree is hard with varying widths, let's stick to a Column layout for Managers, 
    // and then nested boxes for the visual hierarchy, which is more responsive.

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/staff')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Organograma</h1>
                    <p className="text-slate-500">Estrutura organizacional hierárquica.</p>
                </div>
            </div>

            <div className="overflow-x-auto pb-10">
                <div className="min-w-max flex flex-col gap-8">
                    {/* Level 0: Company / Managers */}
                    <div className="flex flex-wrap justify-center gap-12 items-start">
                        {Object.entries(hierarchy).sort().map(([managerName, supervisors]) => (
                            <div key={managerName} className="flex flex-col items-center">
                                {/* Manager Node */}
                                <div className="bg-blue-900 text-white rounded-xl p-4 w-64 shadow-lg border-2 border-blue-800 relative z-10 text-center mb-8">
                                    <h2 className="font-bold text-lg">{managerName}</h2>
                                    <p className="text-blue-200 text-xs uppercase tracking-wider">Gestor de Área</p>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-800 text-[10px] px-2 py-0.5 rounded-full">
                                        Level 1
                                    </div>
                                    {/* Connector Down */}
                                    <div className="absolute top-full left-1/2 w-0.5 h-8 bg-blue-900/30"></div>
                                </div>

                                {/* Supervisors Container */}
                                <div className="flex flex-wrap justify-center gap-8 pl-4 pr-4 border-t-2 border-slate-200 pt-8 relative">
                                    {/* Connector Fix: This border-t acts as the horizontal branch line. 
                                         We position it with some padding/margin to look like a tree wrapper. */}

                                    {Object.entries(supervisors).sort().map(([supervisorName, leaders]) => (
                                        <div key={supervisorName} className="flex flex-col items-center relative">
                                            {/* Vertical line up to horizontal bar */}
                                            <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-slate-200"></div>

                                            {/* Supervisor Node */}
                                            <div className="bg-white text-slate-800 border border-slate-200 rounded-lg p-3 w-56 shadow-sm relative z-10 text-center mb-6">
                                                <h3 className="font-bold text-md text-blue-800">{supervisorName}</h3>
                                                <p className="text-slate-400 text-[10px] uppercase">Supervisor</p>
                                                {/* Connector Down */}
                                                <div className="absolute top-full left-1/2 w-0.5 h-6 bg-slate-200"></div>
                                            </div>

                                            {/* Leaders Container */}
                                            <div className="flex flex-wrap justify-center gap-4 pt-6 relative border-t border-slate-200/50">
                                                <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-slate-200"></div>

                                                {Object.entries(leaders).sort().map(([leaderName, team]) => (
                                                    <div key={leaderName} className="flex flex-col items-center relative px-2">
                                                        {/* Connector Up */}
                                                        {/* <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-300"></div> */}

                                                        {/* Leader Node */}
                                                        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 w-48 shadow-sm text-center mb-2 hover:bg-white transition-colors">
                                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                                <h4 className="font-semibold text-sm text-slate-700">{leaderName}</h4>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400">{team.length} Colaboradores</p>
                                                        </div>

                                                        {/* Employee List (Collapsed/Stacked or direct?) 
                                                            Exhibiting 100 employees is too much. 
                                                            Let's show a count bubble or expandable list.
                                                            For org chart overview, usually you stop at Leader or key roles. 
                                                            Let's show just a summarized 'Team Box' 
                                                        */}
                                                        <div className="mt-1">
                                                            {team.length > 0 && (
                                                                <div className="flex -space-x-1.5 justify-center overflow-hidden py-1">
                                                                    {team.slice(0, 5).map(emp => (
                                                                        <div key={emp.id} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500" title={emp.name}>
                                                                            {emp.name.charAt(0)}
                                                                        </div>
                                                                    ))}
                                                                    {team.length > 5 && (
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                                            +{team.length - 5}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
