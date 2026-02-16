import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, moduleId, lessonId } = await params;

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

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
                moduleId: moduleId,
            }
        });

        if (!lesson) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const publishedLesson = await db.lesson.update({
            where: {
                id: lessonId,
                moduleId: moduleId,
            },
            data: {
                isPublished: true,
            }
        });

        return NextResponse.json(publishedLesson);
    } catch (error) {
        console.log("[LESSON_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
