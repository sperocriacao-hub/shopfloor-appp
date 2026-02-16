import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome to Spero Academy!</p>
        </div>
    );
}
