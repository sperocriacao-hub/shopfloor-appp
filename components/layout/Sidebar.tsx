"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Settings, Ship, Boxes, Activity, Users, Menu, ChevronLeft, ChevronRight, Microscope, Wrench, Package, Anchor, Hammer, BarChart2, Smartphone, UserCheck, ClipboardCheck, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SystemConfigModal } from '@/components/config/SystemConfigModal';
import { useShopfloorStore } from '@/store/useShopfloorStore';
import { AppModule } from '@/types';

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Auto-collapse on mobile/tablet on mount and resize
    useEffect(() => {
        const checkSize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    const { currentUser, logout } = useShopfloorStore();
    const router = useRouter(); // Actually imported? Need to check imports

    // --- Global Auth Guard ---
    useEffect(() => {
        // If no user and NOT on login page, redirect to login
        if (!currentUser && pathname !== '/login' && pathname !== '/admin/debug') {
            router.push('/login');
        }
    }, [currentUser, pathname, router]);

    // Map routes to Permission Modules
    // Map routes to Permission Modules
    const navItems = [
        // --- Operacional ---
        { name: 'Dashboard', href: '/', icon: Home, module: 'dashboard', section: 'Operacional' },
        { name: 'Supervisor', href: '/supervisor', icon: UserCheck, module: 'supervisor', section: 'Operacional' },

        // --- Produção ---
        { name: 'Ordens de Produção', href: '/orders', icon: Activity, module: 'orders', section: 'Produção' },
        { name: 'Produtos & Roteiros', href: '/products', icon: Package, module: 'products', section: 'Produção' },
        { name: 'Engenharia', href: '/engineering', icon: Microscope, module: 'engineering', section: 'Produção' },
        { name: 'Materiais', href: '/consumables', icon: BarChart2, module: 'consumables', section: 'Produção' },
        { name: 'Scrap & Desperdício', href: '/scrap', icon: /* Trash2 handled in imports? No need to check imports first */ Activity, module: 'scrap', section: 'Produção' }, // Using Activity as placeholder or will update imports

        // --- Recursos ---
        { name: 'Recursos Humanos', href: '/staff', icon: Users, module: 'staff', section: 'Recursos' },
        { name: 'HST & Segurança', href: '/staff/hst', icon: Shield, module: 'staff', section: 'Recursos' },

        // --- Qualidade & Manutenção ---
        { name: 'Qualidade', href: '/quality', icon: ClipboardCheck, module: 'quality', section: 'Qualidade & Manutenção' },
        { name: 'Ferramentaria', href: '/tools', icon: Hammer, module: 'tools', section: 'Qualidade & Manutenção' },
        { name: 'Moldes', href: '/molds', icon: Anchor, module: 'molds', section: 'Qualidade & Manutenção' },
        { name: 'Ativos', href: '/assets', icon: Boxes, module: 'assets', section: 'Qualidade & Manutenção' },

        // --- Sistema ---
        { name: 'App Mobile', href: '/mobile', icon: Smartphone, module: 'mobile', section: 'Sistema' },
        { name: 'Admin / Suporte', href: '/admin', icon: Wrench, module: 'admin', section: 'Sistema' },
        { name: 'Modo Shopfloor', href: '/shopfloor', icon: Ship, module: 'legacy', section: 'Sistema' },
    ];

    // Filter items based on permissions
    const visibleItems = navItems.filter(item => {
        if (!currentUser) return false; // Hide all if not logged in (middleware usually handles this, but visual check)
        if (currentUser.role === 'admin') return true; // Master access

        const permission = currentUser.permissions?.[item.module as AppModule];
        return permission && permission !== 'none';
    });

    return (
        <div
            className={cn(
                "flex flex-col bg-blue-900 text-white transition-all duration-300 ease-in-out h-full shadow-xl relative z-20",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header / Logo */}
            <div className="flex h-16 items-center justify-center border-b border-blue-800 p-4 relative">
                <Link href="/" className="flex items-center justify-center w-full">
                    {isCollapsed ? (
                        <img src="/favicon.png" alt="Logo" className="h-10 w-10 object-contain" />
                    ) : (
                        <div className="flex items-center justify-center w-full px-2">
                            <img src="/logo-full.png" alt="NavalShop Logo" className="h-8 w-auto object-contain" />
                        </div>
                    )}
                </Link>
            </div>

            {/* Toggle Button (Desktop Only or always visible to expand) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-blue-700 rounded-full p-1 shadow-md border border-blue-600 hover:bg-blue-600 focus:outline-none z-50 transition-transform active:scale-95"
                title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4 overflow-x-hidden">
                {visibleItems.map((item, index) => {
                    const isActive = pathname === item.href;

                    // Check if we need a section header
                    const prevItem = visibleItems[index - 1];
                    const showSection = !prevItem || prevItem.section !== item.section;

                    return (
                        <div key={item.name}>
                            {!isCollapsed && showSection && (
                                <div className="px-4 py-2 mt-2 mb-1 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                    {item.section}
                                </div>
                            )}
                            {/* Separator for collapsed mode if section changes (optional, maybe just a line) */}
                            {isCollapsed && showSection && index !== 0 && (
                                <div className="my-2 border-t border-blue-800 mx-2"></div>
                            )}

                            <Link
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors mb-0.5 mx-1",
                                    isActive ? "bg-blue-800 text-white shadow-sm" : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                                    isCollapsed ? "justify-center" : "justify-start"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        isCollapsed ? "h-6 w-6" : "mr-3 h-4 w-4",
                                        isActive ? "text-white" : "text-blue-300 group-hover:text-white"
                                    )}
                                    aria-hidden="true"
                                />
                                {!isCollapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="border-t border-blue-800 p-4 overflow-hidden">
                <Link href="/settings" className={cn("flex items-center transition-all hover:bg-blue-800/50 rounded p-1 -m-1 cursor-pointer", isCollapsed ? "justify-center" : "")}>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold border-2 border-blue-400">
                        {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3 truncate">
                            <p className="text-sm font-medium text-white truncate">{currentUser?.name || 'Visitante'}</p>
                            <p className="text-xs text-blue-200 truncate capitalize">{currentUser?.role || 'Faça Login'}</p>
                        </div>
                    )}
                </Link>
                {!isCollapsed && currentUser && (
                    <button onClick={() => logout()} className="text-[10px] text-red-300 hover:text-red-100 mt-2 w-full text-left pl-12 underline">Sair</button>
                )}
            </div>

            <SystemConfigModal open={isConfigOpen} onOpenChange={setIsConfigOpen} />
            {
                !isCollapsed && (
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="absolute bottom-2 left-2 text-blue-400 hover:text-white transition-colors"
                        title="Configurações do Sistema"
                    >
                        <Settings className="h-4 w-4 opacity-50 hover:opacity-100" />
                    </button>
                )
            }
        </div >
    );
}
