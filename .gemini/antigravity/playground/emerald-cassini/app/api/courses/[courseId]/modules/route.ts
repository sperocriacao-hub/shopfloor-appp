import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId } = await params;
        const { title } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (!courseOwner || courseOwner.instructorId !== userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const lastModule = await db.module.findFirst({
            where: {
                courseId: courseId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastModule ? lastModule.position + 1 : 1;

        const module = await db.module.create({
            data: {
                title,
                courseId: courseId,
                position: newPosition,
            },
        });

        return NextResponse.json(module);
    } catch (error) {
        console.log("[MODULES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
