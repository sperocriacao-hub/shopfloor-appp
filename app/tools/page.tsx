"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolInventory } from "@/components/tools/ToolInventory";
import { ToolCheckout } from "@/components/tools/ToolCheckout";
import { ToolCheckin } from "@/components/tools/ToolCheckin"; // TODO
import { Wrench, ArrowRightLeft, History } from "lucide-react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ToolsPage() {
    const { addTool } = useShopfloorStore();

    // Quick add for demo
    const handleAddMockTool = () => {
        const code = prompt("Código/Serial:");
        const name = prompt("Nome da Ferramenta:");
        if (code && name) {
            addTool({
                id: crypto.randomUUID(),
                code,
                name,
                category: 'Manual',
                status: 'available',
                condition: 'good',
                location: 'ferramentaria'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Wrench className="h-8 w-8 text-blue-600" />
                        Gestão de Ferramentaria
                    </h1>
                    <p className="text-slate-500">Controle de inventário, entregas e manutenção.</p>
                </div>
                <Button onClick={handleAddMockTool} variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Cadastrar Ferramenta
                </Button>
            </div>

            <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inventory">Inventário</TabsTrigger>
                    <TabsTrigger value="checkout">Entregas (Check-out)</TabsTrigger>
                    <TabsTrigger value="checkin">Devoluções (Check-in)</TabsTrigger>
                    <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory">
                    <ToolInventory />
                </TabsContent>

                <TabsContent value="checkout">
                    <div className="max-w-2xl mx-auto">
                        <ToolCheckout />
                    </div>
                </TabsContent>

                <TabsContent value="checkin">
                    <div className="max-w-2xl mx-auto text-center py-10 text-slate-500">
                        Selecione "Devoluções" para receber ferramentas. (Em desenvolvimento)
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
