import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function DELETE(
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

        const deletedModule = await db.module.delete({
            where: {
                id: moduleId,
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

        return NextResponse.json(deletedModule);

    } catch (error) {
        console.log("[MODULE_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId, moduleId } = await params;
        const { isPublished, ...values } = await req.json();

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

        const module = await db.module.update({
            where: {
                id: moduleId,
                courseId: courseId,
            },
            data: {
                ...values,
            }
        });

        // Handle publishing logic separately if needed, but for simple updates this is fine.
        // If setting isPublished to true, ensure there is at least one lesson published? 
        // Not strictly required by schema but good for logic. 
        // For now, allow direct update.

        return NextResponse.json(module);
    } catch (error) {
        console.log("[MODULE_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
