"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { generateCarpentryOperations, generateUpholsteryOperations, generateProductionOperations } from "@/lib/workflows";

export default function NewOrderPage() {
    const router = useRouter();
    const { products, createOrder } = useShopfloorStore();

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
        area: ""
    });

    // Workflow Options
    const [hasFoam, setHasFoam] = useState(false); // Carpentry
    const [hasTapizados, setHasTapizados] = useState(false); // Upholstery
    const [hasCanvas, setHasCanvas] = useState(false); // Upholstery

    // Production Options
    const preAssemblyOptionsList = [
        "Madeiras", "Tampas / Plásticos", "Módulos / Móveis", "Consolas", "Tanques", "Acrílicos", "Tekas"
    ];
    const [preAssemblySelection, setPreAssemblySelection] = useState<string[]>([]);
    const [hasBottomPaint, setHasBottomPaint] = useState(false); // Corte Option

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (id: string) => {
        setFormData(prev => ({ ...prev, productModelId: id }));
    };

    const togglePreAssembly = (option: string) => {
        setPreAssemblySelection(prev =>
            prev.includes(option) ? prev.filter(p => p !== option) : [...prev, option]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productModelId) return;

        setIsLoading(true);

        setTimeout(() => {
            // Generate Dynamic Operations
            let activeOps = undefined;
            if (formData.area === 'Carpintaria') {
                activeOps = generateCarpentryOperations(hasFoam);
            } else if (formData.area === 'Estofos') {
                activeOps = generateUpholsteryOperations(hasTapizados, hasCanvas);
            } else if (formData.area === 'Produção') {
                activeOps = generateProductionOperations(preAssemblySelection, hasBottomPaint);
            }

            const newOrder = {
                id: `ord-${Date.now().toString().slice(-6)}`,
                status: 'planned' as const,
                currentOperationId: activeOps ? activeOps[0].id : undefined,
                quantity: Number(formData.quantity),
                productModelId: formData.productModelId,
                po: formData.po,
                pp: formData.pp,
                hin: formData.hin,
                partn: formData.partn,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                finishDate: formData.finishDate ? new Date(formData.finishDate) : undefined,
                br: formData.br,
                country: formData.country,
                customer: formData.customer,
                area: formData.area,

                // Saved Options
                hasFoam: hasFoam,
                hasTapizados: hasTapizados,
                hasCanvas: hasCanvas,
                preAssemblySelection: preAssemblySelection,
                hasBottomPaint: hasBottomPaint,
                activeOperations: activeOps
            };

            createOrder(newOrder);
            router.push("/orders");
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" type="button" onClick={() => router.push('/orders')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Nova Ordem de Produção</h1>
                    <p className="text-slate-500">Cadastro completo de ordem de fabricação.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Product & Basic Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900">1. Seleção de Produto</h3></CardHeader>
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
                            <CardHeader><h3 className="font-semibold text-slate-900">2. Identificação & Localização</h3></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Área de Produção *</label>
                                    <select
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    >
                                        <option value="" disabled>Selecione a área...</option>
                                        <option value="Carpintaria">Carpintaria</option>
                                        <option value="Estofos">Estofos</option>
                                        <option value="Produção">Produção</option>
                                    </select>
                                </div>

                                {/* WORKFLOW OPTIONS: CARPINTARIA */}
                                {formData.area === 'Carpintaria' && (
                                    <div className="p-4 bg-blue-50 rounded-md border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                        <label className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasFoam}
                                                onChange={(e) => setHasFoam(e.target.checked)}
                                                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <span className="text-sm font-bold text-blue-900 block">Incluir Subárea Espumas</span>
                                                <p className="text-xs text-blue-700">Adiciona fluxo: Preparação &rarr; Injeção &rarr; Pick.</p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {/* WORKFLOW OPTIONS: ESTOFOS */}
                                {formData.area === 'Estofos' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                                            <label className="flex items-start space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasTapizados}
                                                    onChange={(e) => setHasTapizados(e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-blue-900 block">Incluir Tapizados</span>
                                                    <p className="text-xs text-blue-700">Adiciona: CNC &rarr; Kanban &rarr; Montagem &rarr; Pick</p>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                                            <label className="flex items-start space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasCanvas}
                                                    onChange={(e) => setHasCanvas(e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-blue-900 block">Incluir Lonas</span>
                                                    <p className="text-xs text-blue-700">Adiciona: CNC &rarr; Montagem &rarr; Pick</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* WORKFLOW OPTIONS: PRODUÇÃO */}
                                {formData.area === 'Produção' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        {/* Corte Option */}
                                        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                                            <label className="flex items-start space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasBottomPaint}
                                                    onChange={(e) => setHasBottomPaint(e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-blue-900 block">Incluir Bottom Paint (Corte)</span>
                                                    <p className="text-xs text-blue-700">Adiciona etapa extra na subárea Corte Casco.</p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Pre-Assembly Options */}
                                        <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                                            <span className="text-sm font-bold text-blue-900 block mb-2">Pré-Montagem (Selecione Aplicáveis):</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {preAssemblyOptionsList.map(opt => (
                                                    <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={preAssemblySelection.includes(opt)}
                                                            onChange={() => togglePreAssembly(opt)}
                                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-xs text-slate-700">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-xs text-blue-500 mt-2">Dica: Áreas Laminação, Corte, Reparação e Montagem já estão inclusas no fluxo.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">HIN (Hull ID Number)</label>
                                    <input type="text" name="hin" value={formData.hin} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ex: PT-ABC12345..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">PARTN (Part Number)</label>
                                    <input type="text" name="partn" value={formData.partn} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ex: PN-998877" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900">3. Dados do Pedido (Sales)</h3></CardHeader>
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
                                    <label className="text-sm font-medium text-slate-700">Cliente (Customer)</label>
                                    <input type="text" name="customer" value={formData.customer} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">País (Country)</label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">BR (Brand/Region?)</label>
                                        <input type="text" name="br" value={formData.br} onChange={handleChange} className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><h3 className="font-semibold text-slate-900">4. Cronograma</h3></CardHeader>
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
                                className="bg-blue-600 hover:bg-blue-700 w-full shadow-md"
                                disabled={!formData.productModelId || isLoading}
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {isLoading ? 'Gerando Workflow...' : 'Criar Ordem'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
