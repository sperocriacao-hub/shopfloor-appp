"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, FileText, Clock, Anchor } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
    const { products, routings } = useShopfloorStore();

    const getRoutingForProduct = (productId: string) => {
        return routings.find(r => r.productModelId === productId);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900">Produtos & Processos</h1>
                    <p className="text-slate-500">Engenharia: Defina seus modelos de barco e roteiros de fabricação.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Modelo
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {products.map((product) => {
                    const routing = getRoutingForProduct(product.id);
                    const totalTime = routing?.operations.reduce((acc, curr) => acc + curr.standardTimeMinutes, 0) || 0;

                    return (
                        <Card key={product.id} className="hover:border-blue-300 transition-colors">
                            <CardHeader className="bg-blue-50/50 border-b pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Anchor className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl text-blue-900">{product.name}</CardTitle>
                                            <p className="text-sm text-slate-500">{product.description}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Roteiro de Fabricação
                                    </h4>
                                    {routing ? (
                                        <div className="space-y-2">
                                            {routing.operations.map((op) => (
                                                <div key={op.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                                                    <div className="flex items-center">
                                                        <span className="font-mono text-slate-400 mr-3 text-xs w-6">{op.sequence}</span>
                                                        <span className="font-medium text-slate-700">{op.name}</span>
                                                    </div>
                                                    <div className="flex items-center text-slate-500 text-xs">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {op.standardTimeMinutes} min
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end text-sm font-medium text-blue-700">
                                                Tempo Total: {Math.floor(totalTime / 60)}h {totalTime % 60}min
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic">Nenhum roteiro definido.</div>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="outline" className="w-full text-blue-700 hover:bg-blue-50">
                                        Editar Roteiro
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        Ver Ordens
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
