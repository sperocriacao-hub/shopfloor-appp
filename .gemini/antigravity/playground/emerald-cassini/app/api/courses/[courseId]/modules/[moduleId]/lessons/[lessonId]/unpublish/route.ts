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

        const unpublishedLesson = await db.lesson.update({
            where: {
                id: lessonId,
                moduleId: moduleId,
            },
            data: {
                isPublished: false,
            }
        });

        const publishedLessonsInModule = await db.lesson.findMany({
            where: {
                moduleId: moduleId,
                isPublished: true,
            }
        });

        if (!publishedLessonsInModule.length) {
            await db.module.update({
                where: {
                    id: moduleId,
                },
                data: {
                    isPublished: false,
                }
            });
        }

        return NextResponse.json(unpublishedLesson);
    } catch (error) {
        console.log("[LESSON_UNPUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
