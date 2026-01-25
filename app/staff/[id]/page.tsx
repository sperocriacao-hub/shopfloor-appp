"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default function EditStaffPage() {
    const router = useRouter();
    const params = useParams();
    const { employees, updateEmployee, assets } = useShopfloorStore();
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
        password: ""
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
                    password: "" // Don't show password
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
                } : undefined
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
