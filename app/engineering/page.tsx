"use client";

import { useState, useMemo } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Save, Activity } from "lucide-react";
import { ProductModel, ProductionLine, SequencingRule } from "@/types";

export default function EngineeringPage() {
    const {
        productionLines, sequencingRules, products, assets,
        addProductionLine, updateProductionLine,
        addSequencingRule, updateSequencingRule, deleteSequencingRule
    } = useShopfloorStore();

    // --- State: Lines ---
    const [lineForm, setLineForm] = useState<Partial<ProductionLine>>({ id: '', description: '', dailyCapacity: 1, allowedModels: [] });
    const [isEditingLine, setIsEditingLine] = useState(false);

    // --- State: Rules ---
    const [ruleForm, setRuleForm] = useState<Partial<SequencingRule>>({ productModelId: '', areaId: '', offsetDays: 0, durationDays: 1 });
    const [isEditingRule, setIsEditingRule] = useState<string | null>(null); // Rule ID if editing

    // Unique Areas from Assets
    const areas = useMemo(() => Array.from(new Set(assets.map(a => a.area))).sort(), [assets]);

    // --- Actions: Lines ---
    const handleSaveLine = () => {
        if (!lineForm.id) return;
        if (isEditingLine) {
            updateProductionLine(lineForm.id, lineForm);
        } else {
            addProductionLine({
                id: lineForm.id,
                description: lineForm.description || `Linha ${lineForm.id}`,
                dailyCapacity: lineForm.dailyCapacity || 1,
                allowedModels: lineForm.allowedModels || [],
                active: true
            });
        }
        setLineForm({ id: '', description: '', dailyCapacity: 1, allowedModels: [] });
        setIsEditingLine(false);
    };

    const handleEditLine = (line: ProductionLine) => {
        setLineForm(line);
        setIsEditingLine(true);
    };

    // --- Actions: Rules ---
    const handleSaveRule = () => {
        if (!ruleForm.productModelId || !ruleForm.areaId) return;

        if (isEditingRule) {
            updateSequencingRule(isEditingRule, ruleForm);
            setIsEditingRule(null);
        } else {
            addSequencingRule({
                id: `rule-${Date.now()}`,
                productModelId: ruleForm.productModelId,
                areaId: ruleForm.areaId,
                offsetDays: ruleForm.offsetDays || 0,
                durationDays: ruleForm.durationDays || 1,
                dependencyAreaId: ruleForm.dependencyAreaId
            });
        }
        setRuleForm({ productModelId: '', areaId: '', offsetDays: 0, durationDays: 1 });
    };

    const handleEditRule = (rule: SequencingRule) => {
        setRuleForm(rule);
        setIsEditingRule(rule.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Engenharia Avançada</h1>
                <p className="text-slate-500">Configuração de Linhas e Regras de Sequenciamento (Lead Times).</p>
            </div>

            <Tabs defaultValue="lines">
                <TabsList>
                    <TabsTrigger value="lines">Linhas de Produção</TabsTrigger>
                    <TabsTrigger value="rules">Regras de Sequenciamento</TabsTrigger>
                </TabsList>

                {/* --- TAB: LINES --- */}
                <TabsContent value="lines" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração de Linhas (A, B, C...)</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            {/* Form */}
                            <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                                <div className="grid gap-2">
                                    <Label>ID da Linha (ex: A, B)</Label>
                                    <Input
                                        value={lineForm.id}
                                        onChange={e => setLineForm({ ...lineForm, id: e.target.value.toUpperCase() })}
                                        disabled={isEditingLine}
                                        maxLength={1}
                                        className="w-20"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Descrição</Label>
                                    <Input
                                        value={lineForm.description}
                                        onChange={e => setLineForm({ ...lineForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Capacidade Diária (Unidades)</Label>
                                    <Input
                                        type="number"
                                        value={lineForm.dailyCapacity}
                                        onChange={e => setLineForm({ ...lineForm, dailyCapacity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <Button onClick={handleSaveLine} className="w-full">
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditingLine ? 'Atualizar Linha' : 'Adicionar Linha'}
                                </Button>
                                {isEditingLine && (
                                    <Button variant="ghost" className="w-full" onClick={() => { setIsEditingLine(false); setLineForm({ id: '' }); }}>Cancel</Button>
                                )}
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {productionLines.map(line => (
                                    <div key={line.id} className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full">
                                                {line.id}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{line.description}</h4>
                                                <div className="text-sm text-slate-500">Capacidade: {line.dailyCapacity}/dia</div>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleEditLine(line)}>
                                            <Edit2 className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </div>
                                ))}
                                {productionLines.length === 0 && (
                                    <div className="text-center py-10 text-slate-400">Nenhuma linha configurada.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB: RULES --- */}
                <TabsContent value="rules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Times & Offsets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5 items-end mb-6 p-4 bg-slate-50 border rounded-md">
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Modelo de Produto</Label>
                                    <Select
                                        value={ruleForm.productModelId}
                                        onValueChange={val => setRuleForm({ ...ruleForm, productModelId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Área Produtiva</Label>
                                    <Select
                                        value={ruleForm.areaId}
                                        onValueChange={val => setRuleForm({ ...ruleForm, areaId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map(a => (
                                                <SelectItem key={a} value={a}>{a}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Offset (Dias Antes)</Label>
                                    <Input
                                        type="number"
                                        value={ruleForm.offsetDays}
                                        onChange={e => setRuleForm({ ...ruleForm, offsetDays: parseInt(e.target.value) })}
                                        title="Quantos dias antes da entrega final esta etapa deve iniciar?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duração (Dias)</Label>
                                    <Input
                                        type="number"
                                        value={ruleForm.durationDays}
                                        onChange={e => setRuleForm({ ...ruleForm, durationDays: parseInt(e.target.value) })}
                                    />
                                </div>
                                <Button onClick={handleSaveRule} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {isEditingRule ? 'Salvar' : 'Adicionar'}
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Modelo</TableHead>
                                        <TableHead>Área</TableHead>
                                        <TableHead>Start Offset (Dias)</TableHead>
                                        <TableHead>Duração (Dias)</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sequencingRules.map(rule => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">
                                                {products.find(p => p.id === rule.productModelId)?.name || rule.productModelId}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{rule.areaId}</Badge>
                                            </TableCell>
                                            <TableCell>T - {rule.offsetDays}</TableCell>
                                            <TableCell>{rule.durationDays} dias</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEditRule(rule)}>
                                                    <Edit2 className="h-4 w-4 text-slate-400" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => deleteSequencingRule(rule.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sequencingRules.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                                                Nenhuma regra de sequenciamento definida.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
