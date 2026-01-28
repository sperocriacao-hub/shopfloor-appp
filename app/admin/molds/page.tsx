"use client";

import { useState, useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select"; // Hypothetical
import { toast } from "sonner";
import { Upload, FileText, Save } from "lucide-react";

export default function SvgMapperPage() {
    const { products, setMoldGeometries, moldGeometries } = useShopfloorStore();

    const [selectedModel, setSelectedModel] = useState("");
    const [partType, setPartType] = useState("Hull"); // Hull, Deck, SmallPart
    const [svgContent, setSvgContent] = useState("");

    const handleSave = () => {
        if (!selectedModel || !svgContent) {
            toast.error("Preencha modelo e conteúdo SVG");
            return;
        }

        const newGeometry = {
            id: `geo-${Date.now()}`,
            productModelId: selectedModel,
            partType,
            svgContent,
            width: 800, // Mock, needs parsing in real app
            height: 600
        };

        // For now just local store update
        setMoldGeometries([...moldGeometries, newGeometry]);
        toast.success("Geometria SVG salva!");
        setSvgContent("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mapeamento de Moldes (SVG)</h1>
                <p className="text-slate-500">Upload de desenhos técnicos para Pin Mapping.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Novo Desenho</CardTitle>
                        <CardDescription>Cole o código SVG ou faça upload.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modelo</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-300 px-3 bg-white"
                                value={selectedModel}
                                onChange={e => setSelectedModel(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Parte</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-300 px-3 bg-white"
                                value={partType}
                                onChange={e => setPartType(e.target.value)}
                            >
                                <option value="Hull">Casco</option>
                                <option value="Deck">Coberta</option>
                                <option value="SmallPart">Pequena Peça</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Conteúdo SVG</label>
                            <Textarea
                                className="font-mono text-xs h-[200px]"
                                placeholder="<svg>...</svg>"
                                value={svgContent}
                                onChange={e => setSvgContent(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleSave} className="w-full">
                            <Save className="mr-2 h-4 w-4" /> Salvar Geometria
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[300px] bg-slate-100 rounded-md p-4 overflow-hidden relative">
                        {svgContent ? (
                            <div
                                className="max-w-full max-h-full"
                                dangerouslySetInnerHTML={{ __html: svgContent }}
                            />
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <FileText className="h-10 w-10 mb-2" />
                                <span>Cole um SVG para visualizar</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card>
                <CardHeader>
                    <CardTitle>Geometrias Cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {moldGeometries.length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhum desenho cadastrado.</p>
                        ) : (
                            moldGeometries.map(g => (
                                <div key={g.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 bg-slate-200 flex items-center justify-center rounded overflow-hidden p-1">
                                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: g.svgContent }} />
                                        </div>
                                        <div>
                                            <div className="font-bold">{g.productModelId}</div>
                                            <div className="text-xs text-slate-500">{g.partType}</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Ver</Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
