"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, UserX, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Employee, AbsenteeismRecord } from "@/types";

export default function AbsenteeismPage() {
    const router = useRouter();
    const { employees, absenteeismRecords, addAbsenteeismRecord, removeAbsenteeismRecord } = useShopfloorStore();

    // State
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState<'daily' | 'history'>('daily');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null); // For Modal

    // Derived Data
    const activeEmployees = employees.filter(e => e.hrStatus === 'active');

    // Get status for current date
    const getStatusForEmployee = (empId: string) => {
        return absenteeismRecords.find(r => r.employeeId === empId && r.date === selectedDate);
    };

    // Stats
    const totalActive = activeEmployees.length;
    const totalAbsent = absenteeismRecords.filter(r => r.date === selectedDate && r.type === 'Full Day').length;
    const totalLate = absenteeismRecords.filter(r => r.date === selectedDate && r.type === 'Late').length;
    const presencePercentage = Math.round(((totalActive - totalAbsent) / totalActive) * 100) || 0;

    // Handlers
    const handleAddRecord = (type: AbsenteeismRecord['type'], duration?: number) => {
        if (!selectedEmployee) return;

        const newRecord: AbsenteeismRecord = {
            id: `abs-${Date.now()}`,
            employeeId: selectedEmployee.id,
            date: selectedDate,
            type,
            durationMinutes: duration,
            timestamp: new Date().toISOString()
        };

        addAbsenteeismRecord(newRecord);
        setSelectedEmployee(null);
    };

    const handleClearStatus = (recordId: string) => {
        removeAbsenteeismRecord(recordId);
        setSelectedEmployee(null); // Close modal if open
    };

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/staff')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-blue-900">Controle de Absenteísmo</h1>
                        <p className="text-slate-500">Gestão diária de presenças e faltas.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm">
                    <Button
                        variant={viewMode === 'daily' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('daily')}
                        className={viewMode === 'daily' ? "bg-blue-600" : ""}
                    >
                        Registro Diário
                    </Button>
                    <Button
                        variant={viewMode === 'history' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('history')}
                        className={viewMode === 'history' ? "bg-blue-600" : ""}
                    >
                        Histórico
                    </Button>
                </div>
            </div>

            {/* Daily View Dashboard */}
            {viewMode === 'daily' && (
                <>
                    {/* Date & Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-white border-blue-100 shadow-sm">
                            <CardContent className="p-4 flex flex-col justify-center h-full">
                                <label className="text-xs font-semibold uppercase text-slate-500 mb-1">Data de Referência</label>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="font-bold text-lg bg-transparent focus:outline-none text-slate-800"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Presença</p>
                                    <h3 className="text-2xl font-bold text-green-900">{presencePercentage}%</h3>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                            </CardContent>
                        </Card>

                        <Card className="bg-red-50 border-red-200">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700">Ausentes</p>
                                    <h3 className="text-2xl font-bold text-red-900">{totalAbsent}</h3>
                                </div>
                                <UserX className="h-8 w-8 text-red-500 opacity-50" />
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-50 border-amber-200">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-700">Atrasos</p>
                                    <h3 className="text-2xl font-bold text-amber-900">{totalLate}</h3>
                                </div>
                                <Clock className="h-8 w-8 text-amber-500 opacity-50" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Employee Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {activeEmployees.map(emp => {
                            const record = getStatusForEmployee(emp.id);
                            let statusColor = "border-l-4 border-l-green-500 bg-white"; // Default: Present
                            let statusText = "Presente";

                            if (record) {
                                if (record.type === 'Full Day') {
                                    statusColor = "border-l-4 border-l-red-500 bg-red-50";
                                    statusText = "Falta";
                                } else if (record.type === 'Late') {
                                    statusColor = "border-l-4 border-l-amber-500 bg-amber-50";
                                    statusText = "Atraso";
                                } else if (record.type === 'Sick Leave') {
                                    statusColor = "border-l-4 border-l-purple-500 bg-purple-50";
                                    statusText = "Baixa";
                                }
                            }

                            return (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className={`relative p-4 rounded-lg shadow-sm border border-slate-200 text-left transition-all hover:shadow-md ${statusColor}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-slate-500">#{emp.workerNumber}</span>
                                        {record && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/50 border border-current opacity-80">{statusText}</span>}
                                    </div>
                                    <h3 className="font-bold text-slate-900 truncate pr-2" title={emp.name}>{emp.name.split(' ')[0]} {emp.name.split(' ').pop()}</h3>
                                    <p className="text-xs text-slate-500 truncate">{emp.workstation || emp.area}</p>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {/* History View Table */}
            {viewMode === 'history' && (
                <Card>
                    <CardHeader><h3 className="font-semibold text-slate-900">Histórico de Ocorrências</h3></CardHeader>
                    <CardContent>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Colaborador</th>
                                    <th className="p-3">Ocorrência</th>
                                    <th className="p-3">Detalhes</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {absenteeismRecords.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                                ) : (
                                    absenteeismRecords
                                        .sort((a, b) => b.date.localeCompare(a.date)) // Sort descending
                                        .map(record => {
                                            const emp = employees.find(e => e.id === record.employeeId);
                                            return (
                                                <tr key={record.id} className="hover:bg-slate-50">
                                                    <td className="p-3 font-mono text-slate-600">{record.date.split('-').reverse().join('/')}</td>
                                                    <td className="p-3 font-medium text-blue-900">{emp?.name || 'Unknown'}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.type === 'Full Day' ? 'bg-red-100 text-red-700' :
                                                                record.type === 'Late' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-purple-100 text-purple-700'
                                                            }`}>
                                                            {record.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-slate-500">
                                                        {record.durationMinutes ? `${record.durationMinutes} min` : '-'}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => removeAbsenteeismRecord(record.id)}
                                                        >
                                                            Remover
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Ação (Dialog simulado para simplicidade) */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">{selectedEmployee.name}</h3>
                            <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-slate-500 mb-4 text-center">Selecione o apontamento para o dia <strong>{selectedDate.split('-').reverse().join('/')}</strong>:</p>

                            <Button
                                className="w-full justify-start text-lg h-14 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                variant="outline"
                                onClick={() => handleAddRecord('Full Day')}
                            >
                                <UserX className="mr-3 h-6 w-6" />
                                Falta Dia Inteiro
                            </Button>

                            <Button
                                className="w-full justify-start text-lg h-14 bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
                                variant="outline"
                                onClick={() => handleAddRecord('Late', 30)}
                            >
                                <Clock className="mr-3 h-6 w-6" />
                                Atraso (Padrão 30m)
                            </Button>

                            <Button
                                className="w-full justify-start text-lg h-14 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                                variant="outline"
                                onClick={() => handleAddRecord('Sick Leave')}
                            >
                                <AlertCircle className="mr-3 h-6 w-6" />
                                Baixa Médica
                            </Button>

                            {/* Option to clear if already exists */}
                            {getStatusForEmployee(selectedEmployee.id) && (
                                <div className="pt-4 border-t mt-4">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-slate-500 hover:text-green-600 hover:bg-green-50"
                                        onClick={() => handleClearStatus(getStatusForEmployee(selectedEmployee.id)!.id)}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Marcar como Presente (Limpar)
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
