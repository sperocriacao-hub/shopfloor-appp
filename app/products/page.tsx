"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, FileText, Clock, Anchor, Download, Upload, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { downloadProductsTemplate, parseProductsExcel } from "@/lib/excel-products";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProductModel, OperationDefinition } from "@/types";
import { RoutingEditor } from "@/components/engineering/RoutingEditor";

import { ProductOrdersList } from "@/components/engineering/ProductOrdersList";
import { OptionsManager } from "@/components/engineering/OptionsManager";
import { Layers } from "lucide-react";

export default function ProductsPage() {
    const router = useRouter();
    const { products, orders, addProduct, updateProduct, removeProduct } = useShopfloorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
    const [editForm, setEditForm] = useState<Partial<ProductModel>>({});
    const [selectedProductForRouting, setSelectedProductForRouting] = useState<ProductModel | null>(null);
    const [isRoutingOpen, setIsRoutingOpen] = useState(false);

    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    // Helpers
    const getRoutingForProduct = (product: ProductModel) => {
        // Now operations are embedded in the product
        return product.operations || [];
    };

    // Handlers
    const handleExport = () => {
        downloadProductsTemplate();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const newProducts = await parseProductsExcel(e.target.files[0]);
                newProducts.forEach(p => addProduct(p));
                alert(`${newProducts.length} modelos importados com sucesso!`);
            } catch (error) {
                alert("Erro ao importar produtos.");
                console.error(error);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este modelo?")) {
            await removeProduct(id);
        }
    };

    const handleEditClick = (product: ProductModel) => {
        setEditingProduct(product);
        setEditForm({ name: product.name, description: product.description });
        setIsEditOpen(true);
    };

    const handleNewClick = () => {
        setEditingProduct(null);
        setEditForm({ name: '', description: '' });
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (editingProduct) {
            // Update
            await updateProduct(editingProduct.id, editForm);
        } else {
            // Create
            if (!editForm.name) return alert("Nome é obrigatório");
            const newProduct: ProductModel = {
                id: `PROD-${Date.now()}`,
                name: editForm.name,
                description: editForm.description || '',
            };
            await addProduct(newProduct);
        }
        setIsEditOpen(false);
        setEditingProduct(null);
        setEditForm({});
    };

    const handleRoutingClick = (product: ProductModel) => {
        setSelectedProductForRouting(product);
        setIsRoutingOpen(true);
    };

    const handleOrdersClick = (product: ProductModel) => {
        setSelectedProductForRouting(product); // Reusing this generic 'selected' state for context
        setIsOrdersOpen(true);
    };

    // Derived state for current dialogs
    const selectedProductOrders = selectedProductForRouting
        ? orders.filter(o => o.productModelId === selectedProductForRouting.id)
        : [];

    const handleSaveRouting = async (operations: OperationDefinition[]) => {
        if (selectedProductForRouting) {
            await updateProduct(selectedProductForRouting.id, { operations });
            setIsRoutingOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900">Engenharia de Produto</h1>
                    <p className="text-slate-500">Gestão de Modelos e Roteiros de Fabricação.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsOptionsOpen(true)} className="border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Layers className="mr-2 h-4 w-4" /> Opcionais e Kits
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx,.xls"
                    />
                    <Button variant="outline" onClick={handleExport} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Download className="mr-2 h-4 w-4" /> Modelo Excel
                    </Button>
                    <Button variant="outline" onClick={handleImportClick} className="border-green-200 text-green-700 hover:bg-green-50">
                        <Upload className="mr-2 h-4 w-4" /> Importar
                    </Button>
                    <Button onClick={handleNewClick} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Modelo
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {products.map((product) => {

                    const operations = getRoutingForProduct(product);
                    const totalTime = operations.reduce((acc, curr) => acc + curr.standardTimeMinutes, 0) || 0;

                    return (
                        <Card key={product.id} className="hover:border-blue-300 transition-colors group relative">
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
                                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditClick(product)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Roteiro ({operations.length} passos)
                                    </h4>
                                    {operations.length > 0 ? (
                                        <div className="space-y-2">
                                            {operations.slice(0, 3).map((op) => (
                                                <div key={op.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                                                    <div className="flex items-center">
                                                        <span className="font-mono text-slate-400 mr-3 text-xs w-6">{op.sequence}</span>
                                                        <span className="font-medium text-slate-700 truncate max-w-[150px]">{op.name}</span>
                                                    </div>
                                                    <div className="flex items-center text-slate-500 text-xs shrink-0">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {op.standardTimeMinutes} min
                                                    </div>
                                                </div>
                                            ))}
                                            {operations.length > 3 && (
                                                <div className="text-xs text-center text-slate-400 italic">
                                                    + {operations.length - 3} operações...
                                                </div>
                                            )}
                                            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end text-sm font-medium text-blue-700">
                                                Tempo Total: {Math.floor(totalTime / 60)}h {totalTime % 60}min
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic py-4 text-center border border-dashed rounded bg-slate-50">
                                            Nenhum roteiro definido.
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="outline" className="w-full text-blue-700 hover:bg-blue-50" onClick={() => handleRoutingClick(product)}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Editar Roteiro
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => handleOrdersClick(product)}>
                                        Ver Ordens
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
                        <DialogDescription>
                            Defina as informações básicas do produto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Modelo</Label>
                            <Input
                                id="name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="col-span-3"
                                placeholder="Ex: Interceptor 40"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">Descrição</Label>
                            <Input
                                id="desc"
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEdit}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Routing Dialog */}
            <Dialog open={isRoutingOpen} onOpenChange={setIsRoutingOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editor de Roteiro - {selectedProductForRouting?.name}</DialogTitle>
                        <DialogDescription>
                            Defina a sequência de operações para a fabricação deste modelo.
                        </DialogDescription>
                    </DialogHeader>

                    <RoutingEditor
                        initialOperations={selectedProductForRouting?.operations || []}
                        onSave={handleSaveRouting}
                    />

                </DialogContent>
            </Dialog>

            {/* Orders Dialog */}
            <Dialog open={isOrdersOpen} onOpenChange={setIsOrdersOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Ordens de Produção - {selectedProductForRouting?.name}</DialogTitle>
                        <DialogDescription>
                            Histórico de ordens vinculadas a este modelo.
                        </DialogDescription>
                    </DialogHeader>

                    <ProductOrdersList orders={selectedProductOrders} />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOrdersOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>Gerenciador de Opcionais e Kits</DialogTitle>
                        <DialogDescription>
                            Defina os Opcionais disponíveis (ex: Teca, Som) e suas checklists de instalação.
                        </DialogDescription>
                    </DialogHeader>

                    <OptionsManager onClose={() => setIsOptionsOpen(false)} />

                </DialogContent>
            </Dialog>
        </div>
    );
}
