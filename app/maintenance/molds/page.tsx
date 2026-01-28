"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { MaintenanceOrder, MaintenancePin } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hammer, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function MaintenanceCockpitPage() {
    const {
        maintenanceOrders, assets, moldGeometries,
        addMaintenancePin, updateMaintenanceOrder
    } = useShopfloorStore();

    const [selectedOrder, setSelectedOrder] = useState<MaintenanceOrder | null>(null);
    const [pinDialog, setPinDialog] = useState<{ x: number, y: number, open: boolean }>({ x: 0, y: 0, open: false });
    const [pinType, setPinType] = useState("gelcoat");

    // Filter generic open orders
    const openOrders = maintenanceOrders.filter(o => o.status !== 'verified');

    const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedOrder) return;

        // Simple bounding rect logic
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPinDialog({ x, y, open: true });
    };

    const confirmPin = () => {
        if (!selectedOrder) return;

        const newPin: MaintenancePin = {
            id: `pin-${Date.now()}`,
            orderId: selectedOrder.id,
            posX: pinDialog.x,
            posY: pinDialog.y,
            type: pinType as any,
            severity: 'repair_needed',
            status: 'open'
        };

        addMaintenancePin(newPin);
        toast.success("Pin adicionado ao mapa!");
        setPinDialog({ ...pinDialog, open: false });
    };

    const closeOrder = () => {
        if (!selectedOrder) return;
        updateMaintenanceOrder(selectedOrder.id, { status: 'completed', completedAt: new Date().toISOString() });
        toast.success("OS Finalizada!");
        setSelectedOrder(null);
    };

    // Find Logic
    const currentAsset = selectedOrder ? assets.find(a => a.id === selectedOrder.assetId) : null;
    // Mock mapping logic: Find geometry by simple 'Hull' type or product match. 
    // In real world, we'd traverse Asset -> ProductModel -> MoldGeometry
    const currentGeometry = moldGeometries.length > 0 ? moldGeometries[0] : null;

    if (selectedOrder) {
        return (
            <div className="min-h-screen bg-slate-50 p-4">
                <div className="max-w-6xl mx-auto space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                            <ArrowLeft className="mr-2" /> Voltar
                        </Button>
                        <h1 className="text-2xl font-bold">OS: {selectedOrder.id} - {currentAsset?.name}</h1>
                        <Button variant="default" className="bg-green-600 hover:bg-green-500" onClick={closeOrder}>
                            <CheckCircle className="mr-2" /> Encerrar OS
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Interactive Map */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Mapa de Danos</CardTitle>
                                <CardDescription>Clique na imagem para adicionar um defeito (Pin).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="relative w-full aspect-video bg-slate-200 rounded border border-slate-300 overflow-hidden cursor-crosshair"
                                    onClick={handleSvgClick}
                                >
                                    {currentGeometry ? (
                                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: currentGeometry.svgContent }} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            Sem desenho técnico associado (Admin &#62; SVG Mapper)
                                        </div>
                                    )}

                                    {/* Render Pins */}
                                    {selectedOrder.pins?.map(pin => (
                                        <div
                                            key={pin.id}
                                            className="absolute w-6 h-6 -ml-3 -mt-3 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white z-10 hover:scale-125 transition-transform cursor-pointer"
                                            style={{ left: `${pin.posX}%`, top: `${pin.posY}%` }}
                                            title={pin.type}
                                        >
                                            !
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details & Pin List */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detalhes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Prioridade:</span>
                                        <Badge variant={selectedOrder.priority === 'critical' ? 'destructive' : 'secondary'}>
                                            {selectedOrder.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Reportado por:</span>
                                        <span>{selectedOrder.reportedBy}</span>
                                    </div>
                                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                                        {selectedOrder.description}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pins ({selectedOrder.pins?.length || 0})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {selectedOrder.pins?.map(pin => (
                                            <li key={pin.id} className="flex justify-between items-center p-2 bg-white border rounded shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-red-500" />
                                                    <span className="capitalize">{pin.type}</span>
                                                </div>
                                                <Badge variant="outline">{pin.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Pin Creation Dialog */}
                <Dialog open={pinDialog.open} onOpenChange={o => setPinDialog({ ...pinDialog, open: o })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Defeito</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tipo de Defeito</Label>
                                <Select value={pinType} onValueChange={setPinType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gelcoat">Reparo Gelcoat</SelectItem>
                                        <SelectItem value="crack">Trinca/Fissura</SelectItem>
                                        <SelectItem value="scratch">Risco Profundo</SelectItem>
                                        <SelectItem value="polish">Polimento Local</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={confirmPin}>Salvar Marcador</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Hammer className="h-8 w-8 text-primary" />
                Cockpit de Manutenção de Moldes
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openOrders.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed rounded-xl">
                        <CheckCircle className="h-12 w-12 mb-4" />
                        <h3 className="text-xl font-medium">Tudo em dia!</h3>
                        <p>Nenhuma ordem de manutenção pendente.</p>
                    </div>
                ) : (
                    openOrders.map(order => (
                        <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500" onClick={() => setSelectedOrder(order)}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-start">
                                    <span>{assets.find(a => a.id === order.assetId)?.name || 'Molde Desconhecido'}</span>
                                    <Badge variant={order.priority === 'critical' ? 'destructive' : 'secondary'}>
                                        {order.priority}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>Reportado por {order.reportedBy}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 mb-4 line-clamp-2">
                                    {order.description}
                                </p>
                                <div className="text-xs text-slate-400">
                                    Criado em {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
