"use client";

import React from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Target, Lightbulb, Activity } from 'lucide-react';
import { KaizenBoard } from '@/components/lean/KaizenBoard';
import { LeanAuditList } from '@/components/lean/LeanAuditList';
import { AuditWizard } from '@/components/lean/AuditWizard';
import { NewKaizenDialog } from '@/components/lean/NewKaizenDialog';

export default function LeanDashboard() {
    const { leanAudits, leanProjects, leanActions } = useShopfloorStore();

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Lean Manufacturing & CI</h1>
                    <p className="text-slate-500">Continuous Improvement Management System (Toyota Production System)</p>
                </div>
                <div className="flex gap-2">
                    <AuditWizard />
                    <NewKaizenDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Audits</p>
                                <h3 className="text-2xl font-bold">{leanAudits.length}</h3>
                            </div>
                            <ClipboardCheck className="h-8 w-8 text-blue-500 opacity-75" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Open Kaizens</p>
                                <h3 className="text-2xl font-bold">{leanProjects.filter(p => p.type === 'kaizen' && p.status === 'active').length}</h3>
                            </div>
                            <Lightbulb className="h-8 w-8 text-amber-500 opacity-75" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">A3 Projects</p>
                                <h3 className="text-2xl font-bold">{leanProjects.filter(p => p.type === 'a3').length}</h3>
                            </div>
                            <Target className="h-8 w-8 text-red-500 opacity-75" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Pending Actions</p>
                                <h3 className="text-2xl font-bold">{leanActions.filter(a => a.status !== 'completed' && a.status !== 'verified').length}</h3>
                            </div>
                            <Activity className="h-8 w-8 text-green-500 opacity-75" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="audits">Audits (5S/Gemba)</TabsTrigger>
                    <TabsTrigger value="kaizen">Kaizen Board</TabsTrigger>
                    <TabsTrigger value="a3">A3 Problem Solving</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-slate-500">
                                No recent activity found. Start a new audit or project to see data here.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audits">
                    <LeanAuditList />
                </TabsContent>

                <TabsContent value="kaizen">
                    <KaizenBoard type="kaizen" />
                </TabsContent>

                <TabsContent value="a3">
                    <KaizenBoard type="a3" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
