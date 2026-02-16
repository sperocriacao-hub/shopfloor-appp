"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layout, Compass, List, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const guestRoutes = [
    {
        icon: Layout,
        label: "Dashboard",
        href: "/dashboard",
    },
    {
        icon: Compass,
        label: "Browse",
        href: "/search",
    },
];

const teacherRoutes = [
    {
        icon: List,
        label: "Courses",
        href: "/teacher/courses",
    },
    {
        icon: BarChart,
        label: "Analytics",
        href: "/teacher/analytics",
    },
]

const adminRoutes = [
    {
        icon: List,
        label: "Courses",
        href: "/admin/courses",
    },
    {
        icon: BarChart,
        label: "Analytics",
        href: "/admin/analytics",
    },
]

export const Sidebar = () => {
    const pathname = usePathname();
    const isTeacherPage = pathname?.includes("/teacher");
    const isAdminPage = pathname?.includes("/admin");

    const routes = isTeacherPage ? teacherRoutes : isAdminPage ? adminRoutes : guestRoutes;

    return (
        <div className="flex flex-col w-full h-full border-r bg-white overflow-y-auto shadow-sm">
            <div className="p-6">
                <Link href="/">
                    <p className="font-bold text-xl text-neutral-700">
                        Spero Academy
                    </p>
                </Link>
            </div>
            <div className="flex flex-col w-full">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
                            pathname === route.href && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
                        )}
                    >
                        <div className="flex items-center gap-x-2 py-4">
                            <route.icon size={22} className={cn(
                                "text-slate-500",
                                pathname === route.href && "text-sky-700"
                            )} />
                            {route.label}
                        </div>
                        <div className={cn(
                            "ml-auto opacity-0 border-2 border-sky-700 h-full transition-all",
                            pathname === route.href && "opacity-100"
                        )} />
                    </Link>
                ))}
            </div>
        </div>
    )
}
