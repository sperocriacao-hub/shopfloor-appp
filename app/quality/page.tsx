"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertOctagon, Microscope, Plus, Search, FileText } from "lucide-react";
import { useState } from "react";
import { QualityCase, QualityStatus, QualityMethodology, EightDData, QualityAction } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QualityReports } from "@/components/quality/QualityReports";
import { PrintableEightD } from "@/components/quality/PrintableEightD";

const METHODOLOGY_TEMPLATES = {
    ishikawa: `### Ishikawa (Espinha de Peixe)
- **Máquina**: 
- **Método**: 
- **Material**: 
- **Mão de Obra**: 
- **Medição**: 
- **Meio Ambiente**: `,
    '5whys': `### 5 Porquês
1. Por que? 
2. Por que? 
3. Por que? 
4. Por que? 
5. Por que? `,
    '8d': `### 8D Report
- **D1 (Equipe)**: 
- **D2 (Problema)**: 
- **D3 (Contenção)**: 
- **D4 (Causa Raiz)**: 
- **D5 (Ação Corretiva)**: 
- **D6 (Implementação)**: 
- **D7 (Prevenção)**: 
- **D8 (Congratular)**: `,
    a3: `### A3 Problem Solving
1. **Contexto/Background**: 
2. **Situação Atual**: 
3. **Objetivo**: 
4. **Análise de Causa**: 
5. **Contramedidas**: 
6. **Plano de Ação**: 
7. **Follow-up**: `
};

const DEFAULT_8D_DATA: EightDData = {
    team: "",
    problemDetails: { what: "", where: "", when: "", who: "", how: "", metrics: "" },
    containmentActions: "",
    ishikawa: { machine: "", method: "", material: "", manpower: "", measurement: "", environment: "" },
    fiveWhys: ["", "", "", "", ""],
    rootCause: ""
};

export default function QualityPage() {
    const { qualityCases, qualityActions, assets, orders, addQualityCase, updateQualityCase, addQualityAction, updateQualityAction } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<QualityStatus | 'all'>('all');
    const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<QualityCase | null>(null);
    const [isAddingAction, setIsAddingAction] = useState(false);
    const [actionForm, setActionForm] = useState<Partial<QualityAction>>({ description: '', responsible: '', status: 'pending' });

    // Form State
    const [newCase, setNewCase] = useState<Partial<QualityCase>>({
        type: 'internal',
        severity: 'medium',
        methodology: 'ishikawa',
        status: 'open',
        description: METHODOLOGY_TEMPLATES['ishikawa'],
        assetId: '',
        orderId: ''
    });

    const filteredCases = qualityCases.filter(c => {
        const matchesSearch = c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    const handleCreateCase = async () => {
        if (!newCase.description || !newCase.assetId) return alert("Preencha os campos obrigatórios.");

        const { error } = await addQualityCase({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            description: newCase.description || '',
            type: newCase.type as any,
            severity: newCase.severity as any,

            status: 'open',
            methodology: newCase.methodology as any,
            assetId: newCase.assetId || '',
            orderId: newCase.orderId || undefined,
            dueDate: newCase.dueDate,
            images: newCase.images || [],
            createdBy: 'Admin' // TODO: Get user
        });

        if (error) {
            console.error(error);
            alert(`Erro ao salvar no banco de dados: ${error.message || JSON.stringify(error)}`);
            return;
        }

        setIsNewCaseOpen(false);
        setNewCase({ type: 'internal', severity: 'medium', methodology: 'ishikawa', status: 'open', description: METHODOLOGY_TEMPLATES['ishikawa'], images: [] });
    };

    const getStatusColor = (status: QualityStatus) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800';
            case 'investigating': return 'bg-yellow-100 text-yellow-800';
            case 'action_plan': return 'bg-blue-100 text-blue-800';
            case 'monitoring': return 'bg-purple-100 text-purple-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
                        <Microscope className="h-8 w-8" />
                        Gestão da Qualidade
                    </h1>
                    <p className="text-slate-500">Monitoramento de Não-Conformidades e Ações Corretivas (8D, Ishikawa).</p>
                </div>
                <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Novo Caso
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Registrar Nova Não-Conformidade</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Origem (Asset)</label>
                                    <SearchableSelect
                                        options={assets.map(a => ({ value: a.id, label: `${a.area} - ${a.name}` }))}
                                        value={newCase.assetId || ""}
                                        onChange={(v) => setNewCase({ ...newCase, assetId: v })}
                                        placeholder="Buscar Asset..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Ordem (Opcional)</label>
                                    <SearchableSelect
                                        options={[{ value: "none", label: "Nenhuma" }, ...orders.map(o => ({ value: o.id, label: `${o.productModelId} (PO: ${o.po})` }))]}
                                        value={newCase.orderId || "none"}
                                        onChange={(v) => setNewCase({ ...newCase, orderId: v === "none" ? undefined : v })}
                                        placeholder="Buscar Ordem..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Descrição do Problema</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px]"
                                    value={newCase.description}
                                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                    placeholder="Descreva o problema encontrado de forma clara..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Tipo</label>
                                    <Select
                                        value={newCase.type}
                                        onValueChange={(v: any) => setNewCase({ ...newCase, type: v })}
                                    >
                                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="internal">Falha Interna</SelectItem>
                                            <SelectItem value="supplier">Reclamação Fornecedor</SelectItem>
                                            <SelectItem value="warranty">Retorno Cliente (Garantia)</SelectItem>
                                            <SelectItem value="audit">Auditoria</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Severidade</label>
                                    <Select
                                        value={newCase.severity}
                                        onValueChange={(v: any) => setNewCase({ ...newCase, severity: v })}
                                    >
                                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baixa</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="critical">Crítica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Data Limite (Estimada)</label>
                                    <Input
                                        type="date"
                                        className="bg-white"
                                        value={newCase.dueDate ? newCase.dueDate.split('T')[0] : ''}
                                        onChange={(e) => setNewCase({ ...newCase, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Imagens (Max 4)</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="h-9 text-xs bg-white"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []).slice(0, 4);
                                            const promises = files.map(file => new Promise<string>((resolve) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => resolve(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }));
                                            const base64Images = await Promise.all(promises);
                                            setNewCase({ ...newCase, images: base64Images });
                                        }}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        {newCase.images?.map((img, i) => (
                                            <div key={i} className="h-10 w-10 relative border rounded overflow-hidden">
                                                <img src={img} alt="preview" className="object-cover w-full h-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleCreateCase} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Registrar Caso</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="py-4">
                <Tabs defaultValue="management" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                        <TabsTrigger
                            value="management"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2"
                        >
                            Gestão (Kanban)
                        </TabsTrigger>
                        <TabsTrigger
                            value="actions"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2"
                        >
                            Plano de Ação
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-4 py-2"
                        >
                            Relatórios Avançados
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="management" className="space-y-6 mt-6">
                        {/* Metrics */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Casos Abertos</CardTitle>
                                    <AlertOctagon className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{qualityCases.filter(c => c.status === 'open').length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Em Investigação</CardTitle>
                                    <Search className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{qualityCases.filter(c => c.status === 'investigating').length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Plano de Ação</CardTitle>
                                    <FileText className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{qualityCases.filter(c => c.status === 'action_plan').length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Encerrados</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{qualityCases.filter(c => c.status === 'resolved').length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card className="p-4 flex gap-4 items-center bg-slate-50">
                            <Search className="text-slate-400 h-5 w-5" />
                            <Input
                                placeholder="Buscar por descrição ou ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="flex-1 bg-white"
                            />
                            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="investigating">Investigando</SelectItem>
                                    <SelectItem value="action_plan">Plano de Ação</SelectItem>
                                    <SelectItem value="monitoring">Monitoramento</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                </SelectContent>
                            </Select>
                        </Card>

                        {/* List */}
                        <div className="space-y-4">
                            {filteredCases.map(qc => {
                                const isLate = qc.dueDate && new Date(qc.dueDate) < new Date() && qc.status !== 'resolved';
                                const daysRemaining = qc.dueDate ? Math.ceil((new Date(qc.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

                                return (
                                    <Card key={qc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <div className={`h-2 w-full ${getStatusColor(qc.status)}`} />
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="font-mono">{qc.id}</Badge>
                                                        <Badge className={getStatusColor(qc.status)}>{qc.status.toUpperCase()}</Badge>
                                                        <span className="text-sm text-slate-500">{new Date(qc.createdAt || '').toLocaleDateString()}</span>
                                                        {qc.dueDate && (
                                                            <Badge variant={isLate ? "destructive" : "secondary"} className={isLate ? "bg-red-500 hover:bg-red-600" : "bg-green-100 text-green-800 hover:bg-green-200"}>
                                                                {isLate ? `Atrasado ${Math.abs(daysRemaining || 0)} dias` : `${daysRemaining} dias restantes`}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-slate-800">{qc.description}</h3>
                                                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                                        <span><strong>Asset:</strong> {assets.find(a => a.id === qc.assetId)?.name || qc.assetId}</span>
                                                        <span><strong>Tipo:</strong> {qc.type}</span>
                                                        <span><strong>Severidade:</strong> {qc.severity}</span>
                                                        <span><strong>Metodologia:</strong> {qc.methodology}</span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedSubject(qc)}>
                                                    Gerenciar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="actions" className="mt-6">
                        <div className="space-y-4">
                            <Card className="p-4 bg-slate-50">
                                <h3 className="font-semibold text-lg text-slate-800 mb-2">Plano de Ação Global</h3>
                                <p className="text-slate-500 text-sm">Visualização consolidada de todas as ações corretivas.</p>
                            </Card>

                            {qualityActions.sort((a, b) => new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime()).map(action => {
                                const parentCase = qualityCases.find(c => c.id === action.caseId);
                                const isLate = action.deadline && new Date(action.deadline) < new Date() && action.status !== 'completed';

                                return (
                                    <Card key={action.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => parentCase && setSelectedSubject(parentCase)}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={action.status === 'completed' ? 'secondary' : 'outline'}>
                                                    {action.status === 'completed' ? 'CONCLUÍDO' : 'PENDENTE'}
                                                </Badge>
                                                {isLate && <Badge variant="destructive" className="text-[10px] h-5">ATRASADO</Badge>}
                                                <span className="font-semibold text-slate-900">{action.description}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex gap-3">
                                                <span>Caso: {parentCase?.id}</span>
                                                <span>Resp: {action.responsible}</span>
                                                <span>Prazo: {action.deadline ? new Date(action.deadline).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Button size="sm" variant="ghost" className="text-blue-600">Ver Caso &rarr;</Button>
                                        </div>
                                    </Card>
                                )
                            })}
                            {qualityActions.length === 0 && <p className="text-center py-8 text-slate-500">Nenhuma ação registrada.</p>}
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <QualityReports />
                    </TabsContent>
                </Tabs>

                <Dialog open={!!selectedSubject} onOpenChange={(open) => !open && setSelectedSubject(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Gerenciar Caso 8D: {selectedSubject?.id}</DialogTitle>
                        </DialogHeader>
                        {selectedSubject && (
                            <div className="py-4">
                                <PrintableEightD data={selectedSubject} />
                                <Tabs defaultValue="verify" className="w-full print:hidden">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="verify">1. VERIFICAR (D1-D3)</TabsTrigger>
                                        <TabsTrigger value="plan">2. PLANEAR (D4)</TabsTrigger>
                                        <TabsTrigger value="realize">3. REALIZAR (D5-D8)</TabsTrigger>
                                    </TabsList>

                                    {/* --- TAB 1: VERIFICAR --- */}
                                    <TabsContent value="verify" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-700 mb-2">D1: Equipe</h4>
                                                <Input
                                                    placeholder="Nomes dos membros da equipe..."
                                                    value={(selectedSubject.methodologyData as EightDData)?.team || ""}
                                                    onChange={(e) => {
                                                        const current = selectedSubject.methodologyData as EightDData || DEFAULT_8D_DATA;
                                                        setSelectedSubject({ ...selectedSubject, methodologyData: { ...current, team: e.target.value } });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-700 mb-2">D3: Ações de Contenção</h4>
                                                <Input
                                                    placeholder="Ações imediatas para conter o problema..."
                                                    value={(selectedSubject.methodologyData as EightDData)?.containmentActions || ""}
                                                    onChange={(e) => {
                                                        const current = selectedSubject.methodologyData as EightDData || DEFAULT_8D_DATA;
                                                        setSelectedSubject({ ...selectedSubject, methodologyData: { ...current, containmentActions: e.target.value } });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold text-sm text-slate-700 mb-3">D2: Descrição do Problema (5W1H)</h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['what', 'where', 'when', 'who', 'how', 'metrics'].map((field) => (
                                                    <div key={field}>
                                                        <label className="text-xs font-medium text-slate-500 uppercase">{field === 'metrics' ? 'Quais Métricas?' : `O que / ${field}?`}</label>
                                                        <Input
                                                            className="h-8 text-sm"
                                                            value={((selectedSubject.methodologyData as EightDData)?.problemDetails as any)?.[field] || ""}
                                                            onChange={(e) => {
                                                                const current = selectedSubject.methodologyData as EightDData || DEFAULT_8D_DATA;
                                                                const details = current.problemDetails || DEFAULT_8D_DATA.problemDetails;
                                                                setSelectedSubject({
                                                                    ...selectedSubject,
                                                                    methodologyData: {
                                                                        ...current,
                                                                        problemDetails: { ...details, [field]: e.target.value }
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Images Preview */}
                                        {selectedSubject.images && selectedSubject.images.length > 0 && (
                                            <div className="border rounded-lg p-4 bg-slate-50">
                                                <h4 className="font-semibold text-sm text-slate-700 mb-2">Evidências Fotográficas</h4>
                                                <div className="flex gap-2 overflow-x-auto">
                                                    {selectedSubject.images.map((img, i) => (
                                                        <div key={i} className="h-24 w-24 shrink-0 border rounded overflow-hidden bg-white relative group">
                                                            <img src={img} alt="evidence" className="object-cover w-full h-full" />
                                                            <a href={img} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                                Abrir
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button className="flex-1" onClick={() => updateQualityCase(selectedSubject.id, { methodologyData: selectedSubject.methodologyData })}>Salvar Etapa Verificar</Button>
                                            <Button variant="outline" className="gap-2" onClick={() => toast.success("Enviando e-mail com relatório 8D...")}>
                                                ✉️ Email
                                            </Button>
                                            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                                                🖨️ Imprimir
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* --- TAB 2: PLANEAR --- */}
                                    <TabsContent value="plan" className="space-y-4">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold text-sm text-slate-700 mb-3">D4: Ishikawa (6M)</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['machine', 'method', 'material', 'manpower', 'measurement', 'environment'].map((m) => (
                                                    <div key={m}>
                                                        <label className="text-xs font-medium text-slate-500 uppercase">{m}</label>
                                                        <Input
                                                            className="h-8 text-sm"
                                                            value={((selectedSubject.methodologyData as EightDData)?.ishikawa as any)?.[m] || ""}
                                                            onChange={(e) => {
                                                                const current = selectedSubject.methodologyData as EightDData || DEFAULT_8D_DATA;
                                                                const ishikawa = current.ishikawa || DEFAULT_8D_DATA.ishikawa;
                                                                setSelectedSubject({
                                                                    ...selectedSubject,
                                                                    methodologyData: {
                                                                        ...current,
                                                                        ishikawa: { ...ishikawa, [m]: e.target.value }
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4 bg-slate-50">
                                            <h4 className="font-semibold text-sm text-slate-700 mb-3">D4: 5 Porquês</h4>
                                            <div className="space-y-2">
                                                {[0, 1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex gap-2 items-center">
                                                        <span className="text-xs font-bold text-slate-400 w-6">{i + 1}.</span>
                                                        <Input
                                                            className="h-8 text-sm bg-white"
                                                            placeholder={`Por que? ${i === 4 ? '(Causa Raiz)' : ''}`}
                                                            value={((selectedSubject.methodologyData as EightDData)?.fiveWhys)?.[i] || ""}
                                                            onChange={(e) => {
                                                                const current = selectedSubject.methodologyData as EightDData || DEFAULT_8D_DATA;
                                                                const whys = [...(current.fiveWhys || DEFAULT_8D_DATA.fiveWhys)];
                                                                whys[i] = e.target.value;
                                                                setSelectedSubject({
                                                                    ...selectedSubject,
                                                                    methodologyData: { ...current, fiveWhys: whys }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Declaração da Causa Raiz</label>
                                            <textarea
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                                value={(selectedSubject.methodologyData as EightDData)?.rootCause || ""}
                                                onChange={(e) => {
                                                    const current = selectedSubject.methodologyData as EightDData || DEFAULT_8D_DATA;
                                                    setSelectedSubject({ ...selectedSubject, methodologyData: { ...current, rootCause: e.target.value } });
                                                }}
                                            />
                                        </div>
                                        <Button className="w-full" onClick={() => updateQualityCase(selectedSubject.id, { methodologyData: selectedSubject.methodologyData })}>Salvar Etapa Planejar</Button>
                                    </TabsContent>

                                    {/* --- TAB 3: REALIZAR --- */}
                                    <TabsContent value="realize" className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-sm text-slate-700">D5-D6: Plano de Ação</h4>
                                            <Button size="sm" variant="outline" onClick={() => setIsAddingAction(!isAddingAction)}>
                                                {isAddingAction ? "Cancelar" : "Adicionar Ação"}
                                            </Button>
                                        </div>

                                        {isAddingAction && (
                                            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                                <h5 className="text-sm font-semibold">Nova Ação</h5>
                                                <Input
                                                    placeholder="Descrição da ação..."
                                                    value={actionForm.description}
                                                    onChange={e => setActionForm({ ...actionForm, description: e.target.value })}
                                                />
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Responsável"
                                                        value={actionForm.responsible}
                                                        onChange={e => setActionForm({ ...actionForm, responsible: e.target.value })}
                                                    />
                                                    <Input
                                                        type="date"
                                                        value={actionForm.deadline ? actionForm.deadline.split('T')[0] : ''}
                                                        onChange={e => setActionForm({ ...actionForm, deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                                    />
                                                </div>
                                                <Button size="sm" onClick={async () => {
                                                    if (!selectedSubject || !actionForm.description) return;
                                                    await addQualityAction({
                                                        id: crypto.randomUUID(),
                                                        caseId: selectedSubject.id,
                                                        description: actionForm.description!,
                                                        responsible: actionForm.responsible,
                                                        deadline: actionForm.deadline,
                                                        status: 'pending'
                                                    });
                                                    setIsAddingAction(false);
                                                    setActionForm({ description: '', responsible: '', status: 'pending' });
                                                }}>Salvar Ação</Button>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {qualityActions.filter(a => a.caseId === selectedSubject.id).map(action => (
                                                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={action.status === 'completed'}
                                                            onChange={async (e) => {
                                                                await updateQualityAction(action.id, { status: e.target.checked ? 'completed' : 'pending' });
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <div>
                                                            <p className={`text-sm font-medium ${action.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                                                {action.description}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Resp: {action.responsible || 'N/A'} • Prazo: {action.deadline ? new Date(action.deadline).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={action.status === 'completed' ? 'secondary' : 'outline'}>
                                                        {action.status === 'completed' ? 'Concluído' : 'Pendente'}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {qualityActions.filter(a => a.caseId === selectedSubject.id).length === 0 && !isAddingAction && (
                                                <p className="text-sm text-slate-500 italic text-center py-4">Nenhuma ação registrada.</p>
                                            )}
                                        </div>

                                        {/* Status Management */}
                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Status do Caso</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(['open', 'investigating', 'action_plan', 'monitoring', 'resolved'] as const).map(status => (
                                                    <Button
                                                        key={status}
                                                        variant={selectedSubject.status === status ? "default" : "outline"}
                                                        size="sm"
                                                        className={selectedSubject.status === status ? "bg-blue-600" : ""}
                                                        onClick={async () => {
                                                            await updateQualityCase(selectedSubject.id, { status });
                                                            setSelectedSubject(prev => prev ? ({ ...prev, status }) : null);
                                                        }}
                                                    >
                                                        {status.toUpperCase()}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <DialogFooter className="mt-6">
                                    <Button variant="ghost" onClick={() => setSelectedSubject(null)}>Fechar</Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div >
        </div>
    );
}
