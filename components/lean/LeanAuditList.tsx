"use client";

import React from 'react';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Eye, Trash2 } from 'lucide-react';
import { LeanAudit } from '@/types';
import { AuditWizard } from './AuditWizard';

export function LeanAuditList() {
    const { leanAudits } = useShopfloorStore();

    const getScoreColor = (score: number, max: number) => {
        const percentage = (score / max) * 100;
        if (percentage >= 90) return 'text-green-600 font-bold';
        if (percentage >= 70) return 'text-amber-600 font-bold';
        return 'text-red-600 font-bold';
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Auditorias</CardTitle>
                <div className="space-x-2 flex items-center">
                    <Button size="sm" variant="outline">Exportar</Button>
                    <AuditWizard />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Área</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Auditor</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leanAudits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Nenhuma auditoria realizada ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leanAudits.map((audit) => (
                                <TableRow key={audit.id}>
                                    <TableCell>{new Date(audit.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{audit.area}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="uppercase">{audit.type}</Badge>
                                    </TableCell>
                                    <TableCell>{audit.auditorName}</TableCell>
                                    <TableCell className={getScoreColor(audit.score, audit.maxScore)}>
                                        {audit.score}/{audit.maxScore} ({Math.round((audit.score / audit.maxScore) * 100)}%)
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
