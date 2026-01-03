"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProductPage() {
    const router = useRouter();
    const { addProduct } = useShopfloorStore();

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const newProduct = {
            id: formData.name.toUpperCase().trim(),
            name: formData.name.toUpperCase().trim(),
            description: formData.description
        };

        addProduct(newProduct);

        // Redirect back to New Order page to continue flow
        router.push("/orders/new");
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" type="button" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Novo Modelo</h1>
                    <p className="text-slate-500">Cadastrar um novo modelo de barco.</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Código / Nome do Modelo *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: T23EXOBUS"
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 outline-none uppercase"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Descrição</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ex: Versão Especial 2026"
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 outline-none"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={!formData.name}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Salvar e Voltar
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
