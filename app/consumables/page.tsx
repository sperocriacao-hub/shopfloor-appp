"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsumableImporter } from "@/components/consumables/ConsumableImporter";
import { ConsumablesDashboard } from "@/components/consumables/ConsumablesDashboard";
import { ConsumablesList } from "@/components/consumables/ConsumablesList";
import { PPIView } from "@/components/consumables/PPIView";
import { ScrapView } from "@/components/consumables/ScrapView";
import { CostCenterManager } from "@/components/consumables/CostCenterManager";
import { MaterialRequestForm } from "@/components/consumables/MaterialRequestForm";
import { MaterialWarehouseView } from "@/components/consumables/MaterialWarehouseView";
import { Package } from "lucide-react";
import { useEffect } from "react";

export default function ConsumablesPage() {
    const { syncData } = useShopfloorStore();

    useEffect(() => {
        syncData();
    }, [syncData]);

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Package className="h-8 w-8 text-blue-600" />
                        Gestão de Consumíveis
                    </h1>
                    <p className="text-slate-500">
                        Controle de custos e materiais (Integração AS400).
                    </p>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList className="bg-white p-1 rounded-md border">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="int">INT (BOM)</TabsTrigger>
                    <TabsTrigger value="pcs">PCS (Consumíveis)</TabsTrigger>
                    <TabsTrigger value="pst">PST (Ferramentaria)</TabsTrigger>
                    <TabsTrigger value="ppi">PPI (EPIs)</TabsTrigger>
                    <TabsTrigger value="scrap">Refugo</TabsTrigger>
                    <TabsTrigger value="import">Importar Dados</TabsTrigger>
                    <TabsTrigger value="requests">Pedidos Material</TabsTrigger>
                    <TabsTrigger value="config">Config. Centros</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <ConsumablesDashboard />
                </TabsContent>

                <TabsContent value="int">
                    <ConsumablesList type="INT" title="INT - Materiais de Aplicação Direta (BOM)" />
                </TabsContent>

                <TabsContent value="pcs">
                    <ConsumablesList type="PCS" title="PCS - Consumíveis de Processo" />
                </TabsContent>

                <TabsContent value="pst">
                    <ConsumablesList type="PST" title="PST - Consumíveis de Ferramentaria" />
                </TabsContent>

                <TabsContent value="ppi">
                    <PPIView />
                </TabsContent>

                <TabsContent value="scrap">
                    <ScrapView />
                </TabsContent>

                <TabsContent value="import">
                    <ConsumableImporter />
                </TabsContent>

                <TabsContent value="config">
                    <CostCenterManager />
                </TabsContent>

                <TabsContent value="requests" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Novo Pedido</h2>
                            <MaterialRequestForm onSuccess={() => { }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Warehouse / Logística</h2>
                            <MaterialWarehouseView />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
