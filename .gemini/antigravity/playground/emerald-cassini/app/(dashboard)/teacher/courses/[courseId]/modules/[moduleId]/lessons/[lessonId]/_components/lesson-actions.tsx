"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface LessonActionsProps {
    disabled: boolean;
    courseId: string;
    moduleId: string;
    lessonId: string;
    isPublished: boolean;
}

export const LessonActions = ({
    disabled,
    courseId,
    moduleId,
    lessonId,
    isPublished
}: LessonActionsProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isPublished) {
                await axios.patch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/unpublish`);
                toast.success("Lesson unpublished");
            } else {
                await axios.patch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/publish`);
                toast.success("Lesson published");
            }

            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    const onDelete = async () => {
        try {
            setIsLoading(true);

            await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
            toast.success("Lesson deleted");
            router.push(`/teacher/courses/${courseId}/modules/${moduleId}`);
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-x-2">
            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                variant="outline"
                size="sm"
            >
                {isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Button
                onClick={onDelete}
                disabled={isLoading}
                size="icon"
                variant="destructive"
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    )
}
