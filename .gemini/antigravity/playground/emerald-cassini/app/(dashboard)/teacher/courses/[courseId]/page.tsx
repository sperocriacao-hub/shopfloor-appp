import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

import { db } from "@/lib/db";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { PriceForm } from "./_components/price-form";
import { CircleDollarSign, LayoutList, ListChecks } from "lucide-react";
import { ModulesForm } from "./_components/modules-form";

const CourseIdPage = async ({
    params
}: {
    params: Promise<{ courseId: string }>
}) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const { courseId } = await params;

    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            modules: {
                orderBy: {
                    position: "asc",
                },
            },
        },
    });

    if (!course || course.instructorId !== userId) {
        return redirect("/");
    }

    const requiredFields = [
        course.title,
        course.description,
        course.thumbnail,
        course.price,
        // course.categoryId,
        course.modules.some(module => module.isPublished),
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-2xl font-medium">
                        Course Setup
                    </h1>
                    <span className="text-sm text-slate-700">
                        Complete all fields {completionText}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div>
                    <div className="flex items-center gap-x-2">
                        <div className="bg-sky-100 p-2 rounded-full">
                            <LayoutDashboard className="h-8 w-8 text-sky-700" />
                        </div>
                        <h2 className="text-xl">
                            Customize your course
                        </h2>
                    </div>
                    <TitleForm
                        initialData={course}
                        courseId={course.id}
                    />
                    <DescriptionForm
                        initialData={course}
                        courseId={course.id}
                    />
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <div className="bg-sky-100 p-2 rounded-full">
                                <CircleDollarSign className="h-8 w-8 text-sky-700" />
                            </div>
                            <h2 className="text-xl">
                                Sell your course
                            </h2>
                        </div>
                        <PriceForm
                            initialData={course}
                            courseId={course.id}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-x-2">
                            <div className="bg-sky-100 p-2 rounded-full">
                                <ListChecks className="h-8 w-8 text-sky-700" />
                            </div>
                            <h2 className="text-xl">
                                Course modules
                            </h2>
                        </div>
                        <ModulesForm
                            initialData={course}
                            courseId={course.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseIdPage;
