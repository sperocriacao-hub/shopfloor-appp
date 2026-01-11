"use client";

import { ProductionOrder } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// Badge styles are applied via className directly
import { Activity, Calendar, User, Package, Circle } from "lucide-react";

interface ProductOrdersListProps {
    orders: ProductionOrder[];
}

import { useShopfloorStore } from "@/store/useShopfloorStore";

interface ProductOrdersListProps {
    orders: ProductionOrder[];
}

export function ProductOrdersList({ orders }: ProductOrdersListProps) {
    const { products } = useShopfloorStore();

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                <Package className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p>Nenhuma ordem de produção encontrada para este modelo.</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'planned': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'hold': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'in_progress': return 'Em Execução';
            case 'planned': return 'Planejado';
            case 'hold': return 'Suspenso';
            default: return status;
        }
    }

    // Sort by Start Date Descending, then ID Descending (creation proxy)
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.id.localeCompare(a.id);
    });

    return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedOrders.map(order => {
                    const product = products.find(p => p.id === order.productModelId);
                    // Title Format: Model # HIN (or PO fallback)
                    const identifier = order.hin || order.po || order.id;
                    const title = product ? `${product.name} # ${identifier}` : `Ordem #${identifier}`;

                    return (
                        <div key={order.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'in_progress' ? 'bg-blue-500' : 'bg-transparent'}`} />

                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold text-slate-800">{title}</h4>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <User className="h-3 w-3" /> {order.customer || "Cliente não informado"}
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-50 p-2 rounded">
                                    <span className="text-xs text-slate-500 block">Quantidade</span>
                                    <span className="font-mono font-medium">{order.quantity} un.</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded">
                                    <span className="text-xs text-slate-500 block">Previsão</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        {order.finishDate ? format(new Date(order.finishDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
