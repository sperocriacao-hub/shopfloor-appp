"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function CostCenterManager() {
    const { costCenterMappings, addCostCenterMapping, updateCostCenterMapping, assets, consumableTransactions } = useShopfloorStore();

    // Find all unique Customer Codes from transactions that are NOT in mappings yet
    const knownCodes = new Set(costCenterMappings.map(m => m.customerCode));
    const newCodes = Array.from(new Set(consumableTransactions.map(t => t.customerCode))).filter(c => !knownCodes.has(c));

    // Get unique Areas from assets
    const uniqueAreas = Array.from(new Set(assets.map(a => a.area))).sort();

    const [newMappingDesc, setNewMappingDesc] = useState("");

    const handleAutoCreate = async (code: string) => {
        // Create a blank mapping for this code
        await addCostCenterMapping({
            id: crypto.randomUUID(),
            customerCode: code,
            description: `Auto-generated for ${code}`
        });
    };

    const handleUpdateArea = async (mappingId: string, mappedArea: string) => {
        await updateCostCenterMapping(mappingId, { mappedArea });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Códigos Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                    {newCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {newCodes.map(code => (
                                <Badge key={code} variant="secondary" className="cursor-pointer hover:bg-slate-200" onClick={() => handleAutoCreate(code)}>
                                    + Adicionar {code}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Todos os códigos importados já possuem registro de mapeamento.</p>
                    )}
                </CardContent>
            </Card>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer Code (AS400)</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Área Shopfloor (Vínculo)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {costCenterMappings.map((mapping) => (
                            <TableRow key={mapping.id}>
                                <TableCell className="font-bold">{mapping.customerCode}</TableCell>
                                <TableCell>
                                    <Input
                                        defaultValue={mapping.description}
                                        onBlur={(e) => updateCostCenterMapping(mapping.id, { description: e.target.value })}
                                        className="h-8 w-[250px]"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={mapping.mappedArea || "none"}
                                        onValueChange={(val) => handleUpdateArea(mapping.id, val === "none" ? "" : val)}
                                    >
                                        <SelectTrigger className="w-[300px] bg-white">
                                            <SelectValue placeholder="Selecione uma Área..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="none">-- Sem Vínculo --</SelectItem>
                                            {uniqueAreas.map(area => (
                                                <SelectItem key={area} value={area}>
                                                    {area}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
