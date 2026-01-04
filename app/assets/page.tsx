"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, PlayCircle, StopCircle, Search, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadAssetsTemplate, parseAssetsExcel } from "@/lib/excel-assets";

const router = useRouter();
const { assets, updateAssetStatus, addAsset } = useShopfloorStore();
const fileInputRef = useRef<HTMLInputElement>(null);

const handleExport = () => {
    downloadAssetsTemplate();
};

const handleImportClick = () => {
    fileInputRef.current?.click();
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        try {
            const newAssets = await parseAssetsExcel(e.target.files[0]);
            newAssets.forEach(a => {
                addAsset({
                    id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    ...a as any
                });
            });
            alert(`${newAssets.length} ativos importados com sucesso!`);
        } catch (error) {
            alert("Erro ao importar ativos.");
            console.error(error);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'available': return 'bg-green-100 text-green-700 border-green-200';
        case 'in_use': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'breakdown': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'available': return 'Disponível';
        case 'in_use': return 'Em Produção';
        case 'maintenance': return 'Manutenção';
        case 'breakdown': return 'Quebrado';
        default: return status;
    }
};

// Group assets by Area
const groupedAssets = assets.reduce((acc, asset) => {
    const area = asset.area || 'Outros';
    if (!acc[area]) acc[area] = [];
    acc[area].push(asset);
    return acc;
}, {} as Record<string, typeof assets>);

return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Biblioteca de Ativos</h1>
                <p className="text-slate-500">Gestão de Máquinas, Moldes e Estações de Trabalho.</p>
            </div>
            <div className="flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx,.xls"
                />
                <Button variant="outline" onClick={handleExport} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Download className="mr-2 h-4 w-4" /> Modelo
                </Button>
                <Button variant="outline" onClick={handleImportClick} className="border-green-200 text-green-700 hover:bg-green-50">
                    <Upload className="mr-2 h-4 w-4" /> Importar
                </Button>
                <Button onClick={() => router.push('/assets/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Ativo
                </Button>
            </div>
        </div>

        {/* Filters Placeholder */}
        <div className="flex space-x-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar ativo por nome ou tipo..."
                    className="w-full pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            <Button variant="outline">Filtros</Button>
        </div>

        {Object.entries(groupedAssets).map(([area, areaAssets]) => (
            <div key={area} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center">
                    <span className="w-2 h-6 bg-blue-600 mr-2 rounded-sm"></span>
                    {area}
                    <span className="ml-2 text-sm font-normal text-slate-400">({areaAssets.length} ativos)</span>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {areaAssets.map((asset) => (
                        <Card key={asset.id} className="hover:shadow-md transition-shadow group border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg text-slate-900">{asset.name}</CardTitle>
                                    <p className="text-sm font-medium text-slate-500">{asset.subarea || asset.area}</p>
                                </div>
                                <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", getStatusColor(asset.status))}>
                                    {getStatusLabel(asset.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="py-2">
                                    {/* Optional: Show capabilities or other metadata */}
                                </div>

                                <div className="mt-4 flex space-x-2 border-t pt-4 opacity-75 group-hover:opacity-100 transition-opacity">
                                    {asset.status === 'available' && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={() => updateAssetStatus(asset.id, 'in_use')}
                                        >
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                            Iniciar
                                        </Button>
                                    )}
                                    {asset.status === 'in_use' && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-slate-600 hover:bg-slate-700"
                                            onClick={() => updateAssetStatus(asset.id, 'available')}
                                        >
                                            <StopCircle className="mr-2 h-4 w-4" />
                                            Liberar
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("w-full", asset.status === 'maintenance' ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "")}
                                        onClick={() => updateAssetStatus(asset.id, asset.status === 'maintenance' ? 'available' : 'maintenance')}
                                    >
                                        <Wrench className="mr-2 h-4 w-4" />
                                        Manut.
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        ))}
    </div>
);
}
