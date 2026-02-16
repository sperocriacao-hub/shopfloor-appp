import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, moduleId } = await params;

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

        // Usually you check validation here, e.g. does it have published lessons?
        // For now, just allow publishing.

        const publishedModule = await db.module.update({
            where: {
                id: moduleId,
                courseId: courseId,
            },
            data: {
                isPublished: true,
            }
        });

        return NextResponse.json(publishedModule);
    } catch (error) {
        console.log("[MODULE_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
