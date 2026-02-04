"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserCog, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function StaffListPage() {
    const router = useRouter();
    const { employees } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.workerNumber.includes(searchTerm) ||
        (e.area || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.jobTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-20 fade-in animate-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Colaboradores</h1>
                        <p className="text-slate-500 text-sm">Lista completa e gestão de acessos.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        onClick={() => router.push('/staff/new')}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Novo
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader className="border-b bg-slate-50/50 py-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                            Total: {filteredEmployees.length} Registos
                        </CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Buscar por Nome, Nº, Área ou Função..."
                                className="pl-9 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Colaborador</th>
                                    <th className="px-6 py-3">Função / Área</th>
                                    <th className="px-6 py-3">Contrato</th>
                                    <th className="px-6 py-3">Acesso Sistema</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{emp.name}</span>
                                                <span className="text-xs text-slate-500">Nº {emp.workerNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700">{emp.jobTitle || "N/A"}</span>
                                                <span className="text-xs text-slate-500">{emp.area}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600 capitalize">{emp.contractType?.replace('_', ' ') || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {emp.hasSystemAccess ? (
                                                <BenchmarkAccessBadge role={emp.systemAccess?.role} />
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sem acesso</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={emp.hrStatus === 'active' ? 'default' : 'secondary'} className={emp.hrStatus === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : ''}>
                                                {emp.hrStatus === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/staff/${emp.id}`)}
                                                className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                <UserCog className="mr-2 h-4 w-4" />
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            Nenhum colaborador encontrado com os filtros atuais.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function BenchmarkAccessBadge({ role }: { role?: string }) {
    if (!role) return null;
    const colors: Record<string, string> = {
        admin: "bg-purple-100 text-purple-700 border-purple-200",
        supervisor: "bg-blue-100 text-blue-700 border-blue-200",
        operator: "bg-slate-100 text-slate-700 border-slate-200",
        maintenance: "bg-orange-100 text-orange-700 border-orange-200",
        quality: "bg-teal-100 text-teal-700 border-teal-200"
    };
    return (
        <Badge variant="outline" className={`${colors[role] || "bg-gray-100"} border shadow-none capitalize`}>
            {role}
        </Badge>
    );
}
