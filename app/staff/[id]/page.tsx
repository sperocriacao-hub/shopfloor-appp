"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { AppModule, UserPermissions } from "@/types";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const ALL_MODULES: AppModule[] = [
    'dashboard', 'orders', 'assets', 'products', 'engineering',
    'consumables', 'staff', 'quality', 'tools', 'molds',
    'supervisor', 'mobile', 'admin'
];

const DEFAULT_PERMISSIONS: UserPermissions = {
    dashboard: 'read', orders: 'none', assets: 'none', products: 'none',
    engineering: 'none', consumables: 'none', staff: 'none', quality: 'none',
    tools: 'none', molds: 'none', supervisor: 'none', mobile: 'none', admin: 'none'
};

export default function EditStaffPage() {
    const router = useRouter();
    const params = useParams();
    const { employees, updateEmployee, assets, dailyEvaluations } = useShopfloorStore();
    const [isLoading, setIsLoading] = useState(false);

    // Derive unique areas from assets
    const availableAreas = Array.from(new Set(assets.map(a => a.area))).sort();

    // Initial State - will be populated
    const [formData, setFormData] = useState({
        workerNumber: "",
        name: "",
        contractType: "",
        jobTitle: "", // Função
        group: "",
        area: "",
        workstation: "",
        shift: "",
        supervisor: "",
        leader: "",
        manager: "",
        admissionDate: "",
        contractStartDate: "",
        terminationDate: "",
        birthday: "",
        talentMatrix: "",
        iluo: "I",
        hrStatus: "active",
        hrNotes: "",
        hasSystemAccess: false,
        systemRole: "operator",
        username: "",
        rfidTag: "",
        password: "",
        permissions: DEFAULT_PERMISSIONS
    });

    // Derive workstations based on selected area
    const availableWorkstations = assets
        .filter(a => a.area === formData.area)
        .sort((a, b) => {
            const subA = a.subarea || '';
            const subB = b.subarea || '';
            return subA.localeCompare(subB) || a.name.localeCompare(b.name);
        })
        .map(a => `${a.name} - ${a.subarea || 'Geral'}`);

    useEffect(() => {
        if (params.id) {
            const emp = employees.find(e => e.id === params.id);
            if (emp) {
                setFormData({
                    workerNumber: emp.workerNumber,
                    name: emp.name,
                    contractType: emp.contractType,
                    jobTitle: emp.jobTitle || "", // Load
                    group: emp.group,
                    area: emp.area,
                    workstation: emp.workstation,
                    shift: emp.shift,
                    supervisor: emp.supervisor,
                    leader: emp.leader,
                    manager: emp.manager,
                    admissionDate: emp.admissionDate,
                    contractStartDate: emp.contractStartDate,
                    terminationDate: emp.terminationDate || "",
                    birthday: emp.birthday,
                    talentMatrix: emp.talentMatrix,
                    iluo: emp.iluo,
                    hrStatus: emp.hrStatus,
                    hrNotes: emp.hrNotes || "",
                    hasSystemAccess: emp.hasSystemAccess || false,
                    systemRole: emp.systemAccess?.role || "operator",
                    username: emp.systemAccess?.username || "",
                    rfidTag: emp.rfidTag || "",
                    password: "", // Don't show password
                    permissions: emp.permissions || DEFAULT_PERMISSIONS
                });
            } else {
                router.push('/staff'); // Not found
            }
        }
    }, [params.id, employees, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Reset workstation if area changes
        if (name === 'area') {
            setFormData(prev => ({ ...prev, [name]: value, workstation: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePermissionChange = (module: AppModule, level: 'none' | 'read' | 'write' | 'admin') => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: level
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            updateEmployee(params.id as string, {
                ...formData,
                manager: formData.manager, // Explicitly include new field if needed, though ...formData covers it if it matches type
                iluo: formData.iluo as any,
                hrStatus: formData.hrStatus as any,
                hasSystemAccess: formData.hasSystemAccess,
                systemAccess: formData.hasSystemAccess ? {
                    username: formData.username,
                    password: formData.password || undefined, // Keep old if empty
                    role: formData.systemRole as any
                } : undefined,
                permissions: formData.permissions
            });
            router.push("/staff");
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/staff')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-blue-900">Editar Funcionário</h1>
                    <p className="text-slate-500">Atualização de cadastro.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Identificação - Read Only for some */}
                <Card>
                    <CardHeader><h3 className="font-semibold text-slate-900 border-b pb-2">1. Identificação</h3></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nº Operário</label>
                            <input
                                required
                                name="workerNumber"
                                value={formData.workerNumber}
                                onChange={handleChange}
                                className="input-field bg-slate-50"
                                readOnly // Usually ID shouldn't change easily
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tag RFID / NFC</label>
                            <input
                                name="rfidTag"
                                value={(formData as any).rfidTag || ""}
                                onChange={handleChange}
                                className="input-field font-mono"
                                placeholder="ID do Cartão"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nome Completo *</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Data de Nascimento</label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Estrutura */}
                <Card>
                    <CardHeader><h3 className="font-semibold text-slate-900 border-b pb-2">2. Estrutura & Alocação</h3></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Função (Job Title)</label>
                            <input
                                name="jobTitle"
                                value={(formData as any).jobTitle || ""}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ex: Operador CNC, Soldador..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Área *</label>
                            <select
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Selecione...</option>
                                {availableAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Grupo</label>
                            <input
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Posto de Trabalho</label>
                            <select
                                name="workstation"
                                value={formData.workstation}
                                onChange={handleChange}
                                className="input-field"
                                disabled={!formData.area}
                            >
                                <option value="">Selecione...</option>
                                {availableWorkstations.map(ws => (
                                    <option key={ws} value={ws}>{ws}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Turno</label>
                            <select name="shift" value={formData.shift} onChange={handleChange} className="input-field">
                                <option value="Turno A">Turno A</option>
                                <option value="Turno B">Turno B</option>
                                <option value="Turno C">Turno C</option>
                                <option value="Geral">Geral</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Supervisor</label>
                            <input name="supervisor" value={formData.supervisor} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Líder</label>
                            <input name="leader" value={formData.leader} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Gestor</label>
                            <input
                                name="manager"
                                value={formData.manager || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Gerente de área..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Contrato */}
                <Card>
                    <CardHeader><h3 className="font-semibold text-slate-900 border-b pb-2">3. Dados Contratuais</h3></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tipo de Contrato</label>
                            <select name="contractType" value={formData.contractType} onChange={handleChange} className="input-field">
                                <option value="Determinado">Termo Determinado</option>
                                <option value="Indeterminado">Termo Indeterminado</option>
                                <option value="Temporário">Temporário</option>
                                <option value="Estágio">Estágio</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Status Atual</label>
                            <select name="hrStatus" value={formData.hrStatus} onChange={handleChange} className="input-field">
                                <option value="active">Ativo</option>
                                <option value="vacation">Férias</option>
                                <option value="sick_leave">Baixa Médica</option>
                                <option value="terminated">Desligado</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Data Admissão</label>
                            <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Início Contrato</label>
                            <input type="date" name="contractStartDate" value={formData.contractStartDate} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Data Rescisão</label>
                            <input type="date" name="terminationDate" value={formData.terminationDate} onChange={handleChange} className="input-field" />
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Desenvolvimento */}
                <Card>
                    <CardHeader><h3 className="font-semibold text-slate-900 border-b pb-2">4. Desenvolvimento</h3></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Matriz de Talentos</label>
                            <input
                                name="talentMatrix"
                                value={formData.talentMatrix}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nível ILUO</label>
                            <select name="iluo" value={formData.iluo} onChange={handleChange} className="input-field">
                                <option value="I">I - Initiate</option>
                                <option value="L">L - Learn</option>
                                <option value="U">U - Understand</option>
                                <option value="O">O - Optimize</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Notas Adicionais (RH)</label>
                            <textarea
                                name="hrNotes"
                                value={formData.hrNotes}
                                onChange={handleChange}
                                className="input-field h-24 pt-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Acesso ao Sistema */}
                <Card className={formData.hasSystemAccess ? "border-blue-300 ring-4 ring-blue-50" : ""}>
                    <CardHeader>
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold text-slate-900">5. Acesso ao Sistema</h3>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <span className="text-sm text-slate-600">Conceder Acesso?</span>
                                <input
                                    type="checkbox"
                                    name="hasSystemAccess"
                                    checked={formData.hasSystemAccess}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hasSystemAccess: e.target.checked }))}
                                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    </CardHeader>
                    {formData.hasSystemAccess && (
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Perfil de Acesso (Role) *</label>
                                <select
                                    name="systemRole"
                                    value={formData.systemRole}
                                    onChange={handleChange}
                                    className="input-field font-semibold text-blue-800"
                                    required={formData.hasSystemAccess}
                                >
                                    <option value="operator">Operador (Tablet - Chão de Fábrica)</option>
                                    <option value="leader">Líder (Gestão Turno, Absenteísmo)</option>
                                    <option value="planner">Planejador (Ordens, Métodos)</option>
                                    <option value="admin">Administrador (Total)</option>
                                </select>
                                <p className="text-xs text-slate-500">
                                    {formData.systemRole === 'operator' && "Acesso limitado: Pode apenas Iniciar/Pausar/Finalizar suas próprias tarefas."}
                                    {formData.systemRole === 'leader' && "Gerencia equipe: Lança faltas, valida horas e monitora status do turno."}
                                    {formData.systemRole === 'planner' && "Backoffice: Cria ordens, define roteiros e visualiza KPIs."}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Usuário *</label>
                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder={formData.workerNumber || "user.name"}
                                        required={formData.hasSystemAccess}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Redefinir Senha</label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field font-mono"
                                        placeholder="Manter atual"
                                    />
                                    <p className="text-[10px] text-slate-400">Deixe em branco para não alterar.</p>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>


                {/* 6. Matriz de Permissões */}
                {formData.hasSystemAccess && (
                    <Card className="border-blue-300 ring-4 ring-blue-50">
                        <CardHeader>
                            <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" /> 6. Matriz de Permissões
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left font-medium py-2 text-slate-500">Módulo</th>
                                            <th className="text-center font-medium py-2 text-slate-500">Sem Acesso</th>
                                            <th className="text-center font-medium py-2 text-slate-500">Leitura</th>
                                            <th className="text-center font-medium py-2 text-slate-500">Escrita</th>
                                            <th className="text-center font-medium py-2 text-slate-500">Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {ALL_MODULES.map(module => (
                                            <tr key={module} className="hover:bg-slate-50">
                                                <td className="py-2 text-slate-700 font-medium capitalize">{module}</td>
                                                {(['none', 'read', 'write', 'admin'] as const).map(level => (
                                                    <td key={level} className="text-center py-2">
                                                        <label className="cursor-pointer flex justify-center w-full h-full items-center">
                                                            <input
                                                                type="radio"
                                                                name={`perm_${module}`}
                                                                checked={formData.permissions[module] === level}
                                                                onChange={() => handlePermissionChange(module, level)}
                                                                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                            />
                                                        </label>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 7. Desempenho & HST (Radar, Trends & Alerts) */}
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold text-slate-900 border-b pb-2">7. Desempenho & HST</h3>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const empEvals = dailyEvaluations.filter(e => e.employeeId === params.id);
                            if (empEvals.length === 0) return <p className="text-slate-500 py-8 text-center">Ainda sem avaliações registradas para gerar métricas.</p>;

                            const total = empEvals.length;
                            const avg = {
                                hst: empEvals.reduce((sum, e) => sum + e.hstScore, 0) / total,
                                epi: empEvals.reduce((sum, e) => sum + e.epiScore, 0) / total,
                                cleaning: empEvals.reduce((sum, e) => sum + e.postCleaningScore, 0) / total,
                                quality: empEvals.reduce((sum, e) => sum + e.qualityScore, 0) / total,
                                efficiency: empEvals.reduce((sum, e) => sum + e.efficiencyScore, 0) / total,
                                objectives: empEvals.reduce((sum, e) => sum + e.objectivesScore, 0) / total,
                                attitude: empEvals.reduce((sum, e) => sum + e.attitudeScore, 0) / total,
                            };

                            const overallAvg = Object.values(avg).reduce((a, b) => a + b, 0) / 7;

                            // Radar Data
                            const radarData = [
                                { subject: 'HST', A: avg.hst, fullMark: 4 },
                                { subject: 'EPI', A: avg.epi, fullMark: 4 },
                                { subject: '5S', A: avg.cleaning, fullMark: 4 },
                                { subject: 'Quali', A: avg.quality, fullMark: 4 },
                                { subject: 'Efic', A: avg.efficiency, fullMark: 4 },
                                { subject: 'Obj', A: avg.objectives, fullMark: 4 },
                                { subject: 'Post', A: avg.attitude, fullMark: 4 },
                            ];

                            // Trend Data (Last 30 Days)
                            const sortedEvals = [...empEvals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30);
                            const trendData = sortedEvals.map(ev => {
                                const dayAvg = (ev.hstScore + ev.epiScore + ev.postCleaningScore + ev.qualityScore + ev.efficiencyScore + ev.objectivesScore + ev.attitudeScore) / 7;
                                return {
                                    date: new Date(ev.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
                                    score: Number(dayAvg.toFixed(1)),
                                    hst: ev.hstScore
                                };
                            });

                            return (
                                <div className="space-y-6">
                                    {/* Score / Recognition Badges */}
                                    <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-50 p-4 rounded-lg border">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500 uppercase tracking-wide">Média Geral</p>
                                                <p className={`text-3xl font-bold ${overallAvg >= 3.5 ? 'text-green-600' : overallAvg < 2.5 ? 'text-red-500' : 'text-yellow-600'}`}>
                                                    {overallAvg.toFixed(1)}
                                                </p>
                                            </div>

                                            {overallAvg >= 3.8 && (
                                                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold border border-yellow-300 flex items-center gap-2 animate-pulse">
                                                    ★ Star Performer
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {avg.epi < 2.5 && (
                                                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold border border-red-300 flex items-center gap-2">
                                                    <Shield className="w-4 h-4" /> Alerta EPI
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[350px]">
                                        {/* Chart 1: Radar */}
                                        <div className="w-full h-full">
                                            <h4 className="text-sm font-semibold text-center text-slate-500 mb-2">Perfil de Competências</h4>
                                            <ResponsiveContainer width="100%" height="90%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                    <PolarGrid />
                                                    <PolarAngleAxis dataKey="subject" />
                                                    <PolarRadiusAxis angle={30} domain={[0, 4]} />
                                                    <Radar name="Employee" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Chart 2: Trends */}
                                        <div className="w-full h-full">
                                            <h4 className="text-sm font-semibold text-center text-slate-500 mb-2">Evolução (30 Dias)</h4>
                                            <ResponsiveContainer width="100%" height="90%">
                                                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                                    <YAxis domain={[0, 4]} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="score" stroke="#2563eb" name="Geral" strokeWidth={2} dot={{ r: 2 }} />
                                                    <Line type="monotone" dataKey="hst" stroke="#f97316" name="HST" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                <div className="flex justify-end pb-10 gap-3">
                    <Button type="button" variant="outline" onClick={() => router.push('/staff')}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 min-w-[200px]" disabled={isLoading}>
                        <Save className="mr-2 h-5 w-5" />
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>

            <style jsx>{`
                .input-field {
                    @apply flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50;
                }
            `}</style>
        </div>
    );
}
