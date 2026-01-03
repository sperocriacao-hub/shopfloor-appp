"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Briefcase, Award, Pencil, Trash2, Download, Upload, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { downloadStaffTemplate, parseStaffExcel } from "@/lib/excel-staff";

export default function StaffPage() {
    const router = useRouter();
    const { employees, removeEmployee, addEmployee } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        downloadStaffTemplate();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const newStaff = await parseStaffExcel(e.target.files[0]);
                // Add imported employees
                newStaff.forEach(emp => {
                    addEmployee({
                        id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        ...emp as any // Type assertion for simplified import
                    });
                });
                alert(`${newStaff.length} funcionários importados com sucesso!`);
            } catch (error) {
                alert("Erro ao importar arquivo via Excel.");
                console.error(error);
            }
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filteredEmployees = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.workerNumber.includes(searchTerm) ||
            e.area.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : e.hrStatus !== 'terminated';
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir o funcionário ${name}?`)) {
            // Basic validation simulation (Check if linked... omitted for prototype)
            removeEmployee(id);
        }
    };

    const getIluoColor = (level: string) => {
        switch (level) {
            case 'I': return 'bg-red-100 text-red-800';
            case 'L': return 'bg-yellow-100 text-yellow-800';
            case 'U': return 'bg-blue-100 text-blue-800';
            case 'O': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Gestão de RH</h1>
                    <p className="text-slate-500">Controle de eficácia, absenteísmo e skills.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx,.xls"
                    />
                    <Button variant="outline" onClick={() => router.push('/staff/absenteeism')} className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100">
                        <UserX className="mr-2 h-4 w-4" /> Absenteísmo
                    </Button>
                    <Button variant="outline" onClick={handleExport} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Download className="mr-2 h-4 w-4" /> Modelo
                    </Button>
                    <Button variant="outline" onClick={handleImportClick} className="border-green-200 text-green-700 hover:bg-green-50">
                        <Upload className="mr-2 h-4 w-4" /> Importar
                    </Button>
                    <Button onClick={() => router.push('/staff/new')} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Novo
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-blue-900">Total Funcionários</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{employees.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-green-900">Presentes Hoje</CardTitle>
                        <Briefcase className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{employees.filter(e => e.hrStatus === 'active').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-purple-900">Matriz de Talentos</CardTitle>
                        <Award className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{employees.filter(e => e.iluo === 'O' || e.iluo === 'U').length} <span className="text-sm font-normal text-purple-600">(U/O Level)</span></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Buscar por nome, número ou área..."
                            className="flex-1 bg-transparent border-none outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label className="flex items-center space-x-2 text-sm text-slate-600 px-3 border-l">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Ver Inativos</span>
                        </label>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Nº</th>
                                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                                    <th className="px-4 py-3 text-left font-medium">Área / Posto</th>
                                    <th className="px-4 py-3 text-left font-medium">Turno</th>
                                    <th className="px-4 py-3 text-left font-medium">Contrato</th>
                                    <th className="px-4 py-3 text-left font-medium">ILUO</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono">{emp.workerNumber}</td>
                                        <td className="px-4 py-3 font-medium text-blue-900">{emp.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-900">{emp.area}</div>
                                            <div className="text-xs text-slate-500">{emp.workstation}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{emp.shift}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {emp.contractType}
                                            <span className="block text-xs text-slate-400">
                                                {emp.admissionDate.split('-').reverse().join('/')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", getIluoColor(emp.iluo))}>
                                                {emp.iluo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                emp.hrStatus === 'active' ? "bg-green-100 text-green-700" :
                                                    emp.hrStatus === 'vacation' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {emp.hrStatus === 'active' ? 'Ativo' :
                                                    emp.hrStatus === 'vacation' ? 'Férias' : 'Ausente'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                                onClick={() => router.push(`/staff/${emp.id}`)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                onClick={() => handleDelete(emp.id, emp.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
