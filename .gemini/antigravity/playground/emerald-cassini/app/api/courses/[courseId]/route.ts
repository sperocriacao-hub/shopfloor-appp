import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { userId } = await auth();
        const { courseId } = await params;
        const values = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
            },
        });

        if (!course || course.instructorId !== userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedCourse = await db.course.update({
            where: {
                id: courseId,
            },
            data: {
                ...values,
            }
        });

        return NextResponse.json(updatedCourse);
    } catch (error) {
        console.log("[COURSE_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
