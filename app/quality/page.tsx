"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertOctagon, Microscope, Plus, Search, FileText } from "lucide-react";
import { useState } from "react";
import { QualityCase, QualityStatus, QualityMethodology } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

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

export default function QualityPage() {
    const { qualityCases, qualityActions, assets, orders, addQualityCase, updateQualityCase } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<QualityStatus | 'all'>('all');
    const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<QualityCase | null>(null);

    // Form State
    const [newCase, setNewCase] = useState<Partial<QualityCase>>({
        type: 'internal',
        severity: 'medium',
        methodology: 'ishikawa',
        status: 'open',
        description: '',
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

        await addQualityCase({
            id: `qc-${Date.now()}`,
            createdAt: new Date().toISOString(),
            description: newCase.description || '',
            type: newCase.type as any,
            severity: newCase.severity as any,
            status: 'open',
            methodology: newCase.methodology as any,
            assetId: newCase.assetId || '',
            status: 'open',
            methodology: newCase.methodology as any,
            assetId: newCase.assetId || '',
            orderId: newCase.orderId || undefined,
            dueDate: newCase.dueDate,
            images: newCase.images || [],
            createdBy: 'Admin' // TODO: Get user
        });
        setIsNewCaseOpen(false);
        setNewCase({ type: 'internal', severity: 'medium', methodology: 'ishikawa', status: 'open', description: '', images: [] });
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
                                    <Select
                                        value={newCase.assetId}
                                        onValueChange={(v) => setNewCase({ ...newCase, assetId: v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {assets.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Ordem (Opcional)</label>
                                    <Select
                                        value={newCase.orderId || "none"}
                                        onValueChange={(v) => setNewCase({ ...newCase, orderId: v === "none" ? undefined : v })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhuma</SelectItem>
                                            {orders.map(o => (
                                                <SelectItem key={o.id} value={o.id}>{o.productModelId} (PO: {o.po})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Descrição do Problema / Análise</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] font-mono"
                                    value={newCase.description}
                                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                    placeholder="Descreva o defeito ou preencha o modelo..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Tipo</label>
                                    <Select
                                        value={newCase.type}
                                        onValueChange={(v: any) => setNewCase({ ...newCase, type: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baixa</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="critical">Crítica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Metodologia</label>
                                    <Select
                                        value={newCase.methodology}
                                        onValueChange={(v: any) => {
                                            const template = METHODOLOGY_TEMPLATES[v as keyof typeof METHODOLOGY_TEMPLATES];
                                            setNewCase({
                                                ...newCase,
                                                methodology: v,
                                                // Only inject if description is empty or looks like a different template
                                                description: (!newCase.description || newCase.description.length < 10) ? template : newCase.description
                                            });
                                        }}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ishikawa">Ishikawa (Espinha Peixe)</SelectItem>
                                            <SelectItem value="5whys">5 Porquês</SelectItem>
                                            <SelectItem value="8d">8D Report</SelectItem>
                                            <SelectItem value="a3">A3 Problem Solving</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>



                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Data Limite (Fechamento)</label>
                                    <Input
                                        type="date"
                                        value={newCase.dueDate ? newCase.dueDate.split('T')[0] : ''}
                                        onChange={(e) => setNewCase({ ...newCase, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Estimativa de resolução.</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Imagens (Max 4)</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="h-9 text-xs"
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

                            <Button onClick={handleCreateCase} className="w-full mt-2">Registrar Caso</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

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
                {filteredCases.map(qc => (
                    <Card key={qc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className={`h-2 w-full ${getStatusColor(qc.status)}`} />
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="font-mono">{qc.id}</Badge>
                                        <Badge className={getStatusColor(qc.status)}>{qc.status.toUpperCase()}</Badge>
                                        <span className="text-sm text-slate-500">{new Date(qc.createdAt || '').toLocaleDateString()}</span>
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
                ))}
            </div>

            <Dialog open={!!selectedSubject} onOpenChange={(open) => !open && setSelectedSubject(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Caso de Qualidade: {selectedSubject?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedSubject && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-500">Descrição</h4>
                                    <p className="text-slate-900">{selectedSubject.description}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-500">Detalhes</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li><strong>Asset:</strong> {assets.find(a => a.id === selectedSubject.assetId)?.name}</li>
                                        <li><strong>Tipo:</strong> {selectedSubject.type}</li>
                                        <li><strong>Severidade:</strong> {selectedSubject.severity}</li>
                                        <li><strong>Metodologia:</strong> {selectedSubject.methodology}</li>
                                        {selectedSubject.dueDate && (
                                            <li><strong className="text-red-600">Prazo:</strong> {new Date(selectedSubject.dueDate).toLocaleDateString()}</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {selectedSubject.images && selectedSubject.images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-500 mb-2">Evidências (Imagens)</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedSubject.images.map((img, i) => (
                                            <div key={i} className="h-32 w-32 shrink-0 border rounded-lg overflow-hidden bg-slate-100 relative group">
                                                <img src={img} alt={`evidencia-${i}`} className="object-cover w-full h-full" />
                                                <a href={img} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                    Abrir
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    Mudar Status do Processo
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(['open', 'investigating', 'action_plan', 'monitoring', 'resolved'] as const).map(status => (
                                        <Button
                                            key={status}
                                            variant={selectedSubject.status === status ? "default" : "outline"}
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

                            <DialogFooter>
                                <Button onClick={() => setSelectedSubject(null)}>Fechar</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
