
import Link from 'next/link';
import { Home, Settings, Ship, Boxes, Activity, Users } from 'lucide-react';

export function Sidebar() {
    const navItems = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Ordens de Produção', href: '/orders', icon: Activity }, // Execution
        { name: 'Biblioteca de Ativos', href: '/assets', icon: Boxes }, // Resources
        { name: 'Engenharia', href: '/products', icon: Settings }, // Engineering
        { name: 'Recursos Humanos', href: '/staff', icon: Users },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-blue-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-blue-800 p-4">
                {/* Increased size to h-12 (approx 50% larger than h-8) */}
                <img src="/logo.png" alt="NavalShop Logo" className="h-12 w-auto object-contain invert mix-blend-screen" />
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white"
                    >
                        <item.icon
                            className="mr-3 h-5 w-5 flex-shrink-0 text-blue-300 group-hover:text-white"
                            aria-hidden="true"
                        />
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="border-t border-blue-800 p-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-700" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Admin</p>
                        <p className="text-xs text-blue-200">Gestor de Produção</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
