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

        const unpublishedModule = await db.module.update({
            where: {
                id: moduleId,
                courseId: courseId,
            },
            data: {
                isPublished: false,
            }
        });

        const publishedModulesInCourse = await db.module.findMany({
            where: {
                courseId: courseId,
                isPublished: true,
            }
        });

        if (!publishedModulesInCourse.length) {
            await db.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    isPublished: false,
                }
            });
        }

        return NextResponse.json(unpublishedModule);
    } catch (error) {
        console.log("[MODULE_UNPUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
