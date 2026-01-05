"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, MapPin, CheckSquare, Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewOrderPage() {
    const router = useRouter();
    const { products, assets, productOptions, createOrder } = useShopfloorStore();

    const [formData, setFormData] = useState({
        productModelId: "",
        quantity: 1,
        po: "",
        pp: "",
        hin: "",
        partn: "",
        startDate: new Date().toISOString().split('T')[0],
        finishDate: "",
        br: "",
        country: "",
        customer: "",
        assetId: "" // Target Station (Shopfloor 3.0)
    });

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleOption = (optId: string) => {
        setSelectedOptions(prev =>
            prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
        );
    };

    const handleProductSelect = (id: string) => {
        setFormData(prev => ({ ...prev, productModelId: id }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productModelId) return;

        setIsLoading(true);

        setTimeout(async () => {
            // Logic:
            // 1. If product has defined operations (from Engineering), utilize them to set 'activeOperations'.
            // 2. We don't use 'generate*Operations' legacy functions anymore if we are fully Shopfloor 3.0.
            //    However, to maintain backward compat while migrating, we will just use the new flow.

            const selectedProduct = products.find(p => p.id === formData.productModelId);
            const activeOps = selectedProduct?.operations || [];

            // Auto-start operation? No, we just plan it.
            // Initial operation: The first one in the sequence.
            const firstOpId = activeOps.length > 0 ? activeOps[0].id : undefined;

            const newOrder = {
                id: `ord-${Date.now().toString().slice(-6)}`,
                status: 'planned' as const,
                currentOperationId: firstOpId,
                quantity: Number(formData.quantity),
                productModelId: formData.productModelId,
                po: formData.po,
                pp: formData.pp,
                hin: formData.hin,
                partn: formData.partn,
                activeOperations: activeOps, // Store copy of operations for this instance

                // Location & Timing
                assetId: formData.assetId, // Target Station
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                finishDate: formData.finishDate ? new Date(formData.finishDate) : undefined,
                br: formData.br,
                country: formData.country,
                customer: formData.customer,

                // Shopfloor 3.0
                selectedOptions: selectedOptions
            };

            await createOrder(newOrder);
            router.push("/orders");
        }, 500);
    };

    // Filter available assets (Only Machines and Workstations should be targets for orders ideally, or maybe specific areas)
    // For now, list all active assets.
    const availableAssets = assets.filter(a => a.status !== 'breakdown');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" type="button" onClick={() => router.push('/orders')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Nova Ordem de Produção</h1>
                    <p className="text-slate-500">Shopfloor 3.0: Seleção de Modelo, Estação e Opcionais.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Product & Location */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900 flex items-center gap-2"><Anchor className="h-4 w-4" /> 1. O que vamos produzir?</h3></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Modelo do Barco *</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        value={formData.productModelId}
                                        onChange={(e) => {
                                            if (e.target.value === 'NEW') {
                                                router.push('/products/new');
                                            } else {
                                                handleProductSelect(e.target.value);
                                            }
                                        }}
                                        required
                                    >
                                        <option value="" disabled>Selecione um modelo...</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                        <option value="NEW" className="font-bold text-blue-600 bg-blue-50">+ Adicionar Novo Modelo</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Quantidade</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900 flex items-center gap-2"><MapPin className="h-4 w-4" /> 2. Onde será produzido? (Estação)</h3></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Estação / Ativo de Destino *</label>
                                    <select
                                        name="assetId"
                                        value={formData.assetId}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    >
                                        <option value="" disabled>Selecione a estação...</option>
                                        {availableAssets.map(asset => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.area} - {asset.subarea ? `${asset.subarea} - ` : ''} {asset.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500">Esta ordem aparecerá no Tablet desta estação.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" /> 3. Configuração (Opcionais & Kits)
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {productOptions.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {productOptions.map(opt => (
                                            <div
                                                key={opt.id}
                                                className={cn(
                                                    "flex items-start space-x-3 p-3 rounded-md border transition-all cursor-pointer",
                                                    selectedOptions.includes(opt.id)
                                                        ? "bg-blue-50 border-blue-200"
                                                        : "bg-white border-slate-200 hover:bg-slate-50"
                                                )}
                                                onClick={() => toggleOption(opt.id)}
                                            >
                                                <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center ${selectedOptions.includes(opt.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                    {selectedOptions.includes(opt.id) && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-slate-900 block">{opt.name}</span>
                                                    {opt.description && <p className="text-xs text-slate-500">{opt.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400 italic text-center py-4 border border-dashed rounded bg-slate-50">
                                        Nenhum opcional cadastrado na Engenharia.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900">4. Dados Administrativos</h3></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">PO (Purchase Order)</label>
                                        <input type="text" name="po" value={formData.po} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">PP (Production Plan)</label>
                                        <input type="text" name="pp" value={formData.pp} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">HIN (Hull ID)</label>
                                    <input type="text" name="hin" value={formData.hin} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Cliente (Customer)</label>
                                    <input type="text" name="customer" value={formData.customer} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">País</label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Brand / Region</label>
                                        <input type="text" name="br" value={formData.br} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900">5. Cronograma</h3></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Data Início (Start)</label>
                                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Data Fim (Finish)</label>
                                        <input type="date" name="finishDate" value={formData.finishDate} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 w-full shadow-md text-lg h-12"
                                disabled={!formData.productModelId || !formData.assetId || isLoading}
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {isLoading ? 'Processando...' : 'Criar Ordem'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
