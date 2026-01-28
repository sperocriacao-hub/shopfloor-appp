"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoldRegistry } from "@/components/molds/MoldRegistry";
import { MoldMaintenanceCockpit } from "@/components/molds/MoldMaintenanceCockpit";
import { MoldIntelligenceData } from "@/components/molds/MoldIntelligenceData";
import { MoldGeometryManager } from "@/components/molds/MoldGeometryManager";
import { Anchor, Hammer, BarChart2, FileTerminal } from "lucide-react";

export default function UnifiedMoldsPage() {
    const [activeTab, setActiveTab] = useState("registry");
    const [screenMode, setScreenMode] = useState<"standard" | "geometry">("standard");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-3">
                    <Anchor className="h-8 w-8" />
                    Gestão Integrada de Moldes
                </h1>
                <p className="text-slate-500">Controle de ativos, manutenção espacial e performance.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="registry">Cadastro</TabsTrigger>
                    <TabsTrigger value="cockpit">Manutenção</TabsTrigger>
                    <TabsTrigger value="intelligence">Inteligência</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="registry" className="pt-6">
                    {screenMode === 'standard' ? (
                        <MoldRegistry onSwitchToGeometry={() => setActiveTab('settings')} />
                    ) : (
                        null
                    )}
                </TabsContent>

                <TabsContent value="cockpit" className="pt-6">
                    <MoldMaintenanceCockpit />
                </TabsContent>

                <TabsContent value="intelligence" className="pt-6">
                    <MoldIntelligenceData />
                </TabsContent>

                <TabsContent value="settings" className="pt-6">
                    <MoldGeometryManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
