"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const Navbar = () => {
    return (
        <div className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center z-50">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <div className="flex items-center gap-x-2">
                    <Link href="/">
                        <p className="font-bold text-xl text-neutral-700">
                            Spero Academy
                        </p>
                    </Link>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto space-x-4">
                    <SignedOut>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/sign-in">Login</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/sign-up">Get Started</Link>
                        </Button>
                    </SignedOut>
                    <SignedIn>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </div>
    );
};
