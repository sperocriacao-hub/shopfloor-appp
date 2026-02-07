"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, AlertTriangle, FileCheck, ClipboardList, Plus, Search, Calendar, ChevronRight, Settings } from "lucide-react";
import { SafetyIncident, Certification, EmployeeCertification } from "@/types";
import { InspectionChecklist } from "@/components/staff/InspectionChecklist";
import { SafetyHeatmap } from "@/components/staff/SafetyHeatmap";

export default function HSTPage() {
    const router = useRouter();
    const {
        employees,
        certifications,
        employeeCertifications,
        safetyIncidents,
        safetyInspections,
        addCertification,
        assignCertification,
        reportIncident,
        addInspection,
        currentUser
    } = useShopfloorStore();

    const [activeTab, setActiveTab] = useState("overview");

    // Incident Form State
    const [incidentForm, setIncidentForm] = useState<Partial<SafetyIncident>>({
        type: 'near_miss',
        severity: 'low',
        status: 'open'
    });
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

    // Cert Management State
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [certForm, setCertForm] = useState<Partial<Certification>>({ validityMonths: 12, riskLevel: 'low' });

    // Assign Cert State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignForm, setAssignForm] = useState<{ empId: string, certId: string, date: string }>({ empId: "", certId: "", date: "" });

    // Derived Areas
    const areas = Array.from(new Set(employees.map(e => e.area).filter(Boolean))).sort();

    // Filter Logic
    const activeIncidents = safetyIncidents.filter(i => i.status !== 'closed');
    const recentInspections = safetyInspections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const handleReportIncident = () => {
        if (!incidentForm.description || !incidentForm.type || !incidentForm.severity) {
            toast.error("Preencha os campos obrigatórios.");
            return;
        }

        const newIncident: SafetyIncident = {
            id: `inc-${Date.now()}`,
            description: incidentForm.description || "",
            type: incidentForm.type as any,
            severity: incidentForm.severity as any,
            area: incidentForm.area,
            rootCauses: incidentForm.rootCauses || [],
            correctiveActions: incidentForm.correctiveActions,
            status: 'open',
            reportedBy: currentUser?.id || "system",
            date: new Date().toISOString(),
            location: incidentForm.area || "General", // Compatibility with type
            createdAt: new Date().toISOString(),
            images: incidentForm.images || []
        };

        reportIncident(newIncident);
        toast.success("Incidente reportado com sucesso.");
        setIsIncidentModalOpen(false);
        setIncidentForm({ type: 'near_miss', severity: 'low', status: 'open' });
    };

    const handleCreateCert = () => {
        if (!certForm.name || !certForm.validityMonths) return;
        const newCert: Certification = {
            id: `cert-${Date.now()}`,
            name: certForm.name,
            description: certForm.description,
            validityMonths: Number(certForm.validityMonths),
            riskLevel: certForm.riskLevel as any || 'low'
        };
        addCertification(newCert);
        toast.success("Certificação criada!");
        setIsCertModalOpen(false);
    };

    const handleAssignCert = () => {
        if (!assignForm.empId || !assignForm.certId || !assignForm.date) return;

        // Calculate expiry
        const certDef = certifications.find(c => c.id === assignForm.certId);
        const issueDate = new Date(assignForm.date);
        const expiryDate = new Date(issueDate);
        if (certDef) expiryDate.setMonth(expiryDate.getMonth() + certDef.validityMonths);

        const newAssignment: EmployeeCertification = {
            id: `ec-${Date.now()}`,
            employeeId: assignForm.empId,
            certificationId: assignForm.certId,
            issueDate: assignForm.date,
            expiryDate: expiryDate.toISOString().split('T')[0],
            status: 'active'
        };

        assignCertification(newAssignment);
        toast.success("Certificação atribuída!");
        setIsAssignModalOpen(false);
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-32">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Higiene e Segurança no Trabalho (HST)
                    </h1>
                    <p className="text-slate-500">Gestão de Certificações, Incidentes e Inspeções</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setIsIncidentModalOpen(true)}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Reportar Incidente
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="certifications">Matriz de Aptidão</TabsTrigger>
                    <TabsTrigger value="incidents">Incidentes</TabsTrigger>
                    <TabsTrigger value="inspections">Inspeções Diárias</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* KPIs ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Safety Score KPI */}
                        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700">Índice de Segurança</CardTitle>
                                <Shield className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-900">
                                    {Math.max(0, 100 - (activeIncidents.length * 5)).toFixed(1)}%
                                </div>
                                <p className="text-xs text-blue-500 mt-1">Target: &gt;95%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Incidentes Ativos</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeIncidents.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {activeIncidents.filter(i => i.severity === 'critical').length} Críticos
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Formações Vencidas</CardTitle>
                                <FileCheck className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {employeeCertifications.filter(ec => ec.status === 'active' && ec.expiryDate && new Date(ec.expiryDate) < new Date()).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Atenção Requerida
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Inspeções (Semana)</CardTitle>
                                <ClipboardList className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{safetyInspections.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Última: {recentInspections[0]?.date ? new Date(recentInspections[0].date).toLocaleDateString() : "N/A"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Heatmap takes 2 cols */}
                        <SafetyHeatmap />

                        {/* Recent Incidents take 1 col */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle className="text-base">Últimos Registos</CardTitle>
                            </CardHeader>
                            <CardContent className="px-2">
                                <div className="space-y-2">
                                    {safetyIncidents.slice(0, 6).map(incident => (
                                        <div key={incident.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 hover:bg-slate-50 p-2 rounded cursor-pointer transition-colors" onClick={() => router.push(`/staff/hst/incidents/${incident.id}`)}>
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={incident.severity === 'critical' || incident.severity === 'high' ? 'destructive' : 'outline'} className="text-[10px] h-5 px-1.5">
                                                        {incident.severity}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">{new Date(incident.createdAt || "").toLocaleDateString()}</span>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 truncate">{incident.description}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </div>
                                    ))}
                                    {safetyIncidents.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Sem registos.</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* CERTIFICATIONS MATRIX */}
                <TabsContent value="certifications" className="space-y-4">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsCertModalOpen(true)}>
                            <Settings className="w-4 h-4 mr-2" /> Gerir Certificações
                        </Button>
                        <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Atribuir Formação
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Matriz de Aptidão</CardTitle>
                            <CardDescription>Status das formações por colaborador</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Colaborador</TableHead>
                                            {certifications.map(cert => (
                                                <TableHead key={cert.id} className="text-center min-w-[100px]">{cert.name}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.filter(e => e.hrStatus === 'active').map(emp => (
                                            <TableRow key={emp.id}>
                                                <TableCell className="font-medium">{emp.name}</TableCell>
                                                {certifications.map(cert => {
                                                    const empCert = employeeCertifications.find(ec => ec.employeeId === emp.id && ec.certificationId === cert.id);
                                                    const isExpired = empCert?.expiryDate && new Date(empCert.expiryDate) < new Date();

                                                    return (
                                                        <TableCell key={cert.id} className="text-center">
                                                            {empCert ? (
                                                                <div className="flex flex-col items-center">
                                                                    <Badge variant={isExpired ? "destructive" : "default"} className={`w-6 h-6 p-0 rounded-full flex items-center justify-center ${!isExpired && "bg-green-500 hover:bg-green-600"}`}>
                                                                        {isExpired ? "!" : "✓"}
                                                                    </Badge>
                                                                    {empCert.expiryDate && (
                                                                        <span className="text-[10px] text-slate-400 mt-1">
                                                                            {new Date(empCert.expiryDate).toLocaleDateString(undefined, { month: '2-digit', year: '2-digit' })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-200">·</span>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INCIDENTS TAB */}
                <TabsContent value="incidents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Incidentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Severidade</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safetyIncidents.map(inc => (
                                        <TableRow key={inc.id}>
                                            <TableCell>{new Date(inc.createdAt || "").toLocaleDateString()}</TableCell>
                                            <TableCell className="capitalize">{inc.type.replace('_', ' ')}</TableCell>
                                            <TableCell>{inc.description}</TableCell>
                                            <TableCell>
                                                <Badge variant={inc.severity === 'critical' ? 'destructive' : inc.severity === 'high' ? 'destructive' : 'outline'}>
                                                    {inc.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{inc.status}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => router.push(`/staff/hst/incidents/${inc.id}`)}>
                                                    Analisar 8D
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>


                {/* INSPECTIONS TAB */}
                <TabsContent value="inspections" className="space-y-4">
                    <InspectionChecklist />

                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Inspeções</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Área</TableHead>
                                        <TableHead>Inspetor</TableHead>
                                        <TableHead>Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safetyInspections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(insp => (
                                        <TableRow key={insp.id}>
                                            <TableCell>{new Date(insp.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{insp.area}</TableCell>
                                            <TableCell>{employees.find(e => e.id === insp.inspectorId)?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={insp.overallScore && insp.overallScore < 80 ? 'destructive' : 'default'} className={insp.overallScore && insp.overallScore >= 90 ? 'bg-green-600' : ''}>
                                                    {insp.overallScore?.toFixed(0)}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {safetyInspections.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-500">Nenhuma inspeção registrada.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* REPORT INCIDENT MODAL */}
            <Dialog open={isIncidentModalOpen} onOpenChange={setIsIncidentModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Reportar Incidente de Segurança</DialogTitle>
                    </DialogHeader>
                    {/* ... Same Form Content ... */}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={incidentForm.type}
                                    onValueChange={(val) => setIncidentForm(p => ({ ...p, type: val as any }))}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="accident">Acidente</SelectItem>
                                        <SelectItem value="incident">Incidente</SelectItem>
                                        <SelectItem value="near_miss">Near Miss (Quase Acidente)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Severidade</Label>
                                <Select
                                    value={incidentForm.severity}
                                    onValueChange={(val) => setIncidentForm(p => ({ ...p, severity: val as any }))}
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
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição do Ocorrido</Label>
                            <Textarea
                                placeholder="Descreva o que aconteceu em detalhes..."
                                value={incidentForm.description || ""}
                                onChange={e => setIncidentForm(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Área / Local</Label>
                            <Select
                                value={incidentForm.area}
                                onValueChange={(val) => setIncidentForm(p => ({ ...p, area: val }))}
                            >
                                <SelectTrigger><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                                <SelectContent>
                                    {areas.map(area => (
                                        <SelectItem key={area} value={area}>{area}</SelectItem>
                                    ))}
                                    <SelectItem value="Outro">Outro / Externo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Causa Raiz (Se conhecida)</Label>
                            <Textarea
                                placeholder="Por que aconteceu?"
                                value={incidentForm.rootCauses?.[0] || ""}
                                onChange={e => setIncidentForm(p => ({ ...p, rootCauses: [e.target.value] }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsIncidentModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleReportIncident}>Reportar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CREATE CERT MODAL */}
            <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Certificação</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Formação</Label>
                            <Input
                                placeholder="Ex: Operação de Empilhador"
                                value={certForm.name || ""}
                                onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Validade (Meses)</Label>
                                <Input type="number" value={certForm.validityMonths} onChange={e => setCertForm(p => ({ ...p, validityMonths: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nível de Risco</Label>
                                <Select value={certForm.riskLevel} onValueChange={v => setCertForm(p => ({ ...p, riskLevel: v as any }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baixo</SelectItem>
                                        <SelectItem value="medium">Médio</SelectItem>
                                        <SelectItem value="high">Alto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleCreateCert}>Criar Certificação</Button>
                </DialogContent>
            </Dialog>

            {/* ASSIGN CERT MODAL */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atribuir Formação a Colaborador</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Colaborador</Label>
                            <Select value={assignForm.empId} onValueChange={v => setAssignForm(p => ({ ...p, empId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {employees.filter(e => e.hrStatus === 'active').sort((a, b) => a.name.localeCompare(b.name)).map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Certificação</Label>
                            <Select value={assignForm.certId} onValueChange={v => setAssignForm(p => ({ ...p, certId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    {certifications.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Emissão</Label>
                            <Input type="date" value={assignForm.date} onChange={e => setAssignForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                    </div>
                    <Button onClick={handleAssignCert}>Atribuir</Button>
                </DialogContent>
            </Dialog>
        </div >
    );
}
