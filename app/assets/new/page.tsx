"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Asset } from "@/types";

export default function NewAssetPage() {
    const router = useRouter();
    const { addAsset } = useShopfloorStore();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Asset>>({
        name: "",
        type: "Machine",
        area: "",
        subarea: "",
        status: "available",
        capabilities: []
    });

    const [capabilitiesInput, setCapabilitiesInput] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const caps = capabilitiesInput.split(',').map(s => s.trim()).filter(Boolean);

        setTimeout(() => {
            addAsset({
                id: `asset-${Date.now()}`,
                name: formData.name || "Novo Ativo",
                type: formData.type || "Machine",
                area: formData.area || "Geral",
                subarea: formData.subarea,
                status: formData.status as any,
                capabilities: caps
            });
            router.push("/assets");
        }, 500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/assets')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Novo Ativo</h1>
                    <p className="text-slate-500">Cadastro de máquina ou estação de trabalho.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader><h3 className="font-semibold text-slate-900 border-b pb-2">Detalhes do Ativo</h3></CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nome do Ativo *</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ex: CNC 01"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tipo</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                                    <option value="Machine">Máquina</option>
                                    <option value="Workstation">Bancada / Estação</option>
                                    <option value="Mold">Molde</option>
                                    <option value="Tool">Ferramenta</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Status Inicial</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                                    <option value="available">Disponível</option>
                                    <option value="maintenance">Em Manutenção</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Área *</label>
                                <input
                                    required
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ex: Laminacao"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Subárea</label>
                                <input
                                    name="subarea"
                                    value={formData.subarea}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ex: Corte"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Capacidades (Opcional)</label>
                            <input
                                value={capabilitiesInput}
                                onChange={(e) => setCapabilitiesInput(e.target.value)}
                                className="input-field"
                                placeholder="Separe por vírgulas. Ex: Corte, Furação, Solda"
                            />
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" disabled={isLoading}>
                        <Save className="mr-2 h-5 w-5" />
                        {isLoading ? 'Salvando...' : 'Cadastrar Ativo'}
                    </Button>
                </div>
            </form>

            <style jsx>{`
                .input-field {
                    @apply flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600;
                }
            `}</style>
        </div>
    );
}
