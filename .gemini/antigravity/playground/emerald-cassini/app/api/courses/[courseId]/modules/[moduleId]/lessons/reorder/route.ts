import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, moduleId } = await params;
        const { list } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                instructorId: userId,
            }
        });

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const module = await db.module.findUnique({
            where: {
                id: moduleId,
                courseId: courseId,
            }
        });

        if (!module) {
            return new NextResponse("Not Found", { status: 404 });
        }

        for (let item of list) {
            await db.lesson.update({
                where: { id: item.id },
                data: { position: item.position }
            });
        }

        return new NextResponse("Success", { status: 200 });
    } catch (error) {
        console.log("[LESSONS_REORDER]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
