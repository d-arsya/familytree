"use client"

import { cn } from "@/lib/utils"
import { HeartIcon } from "lucide-react"

interface FamilyConnectionProps {
    startDate?: Date | null
    endDate?: Date | null
    className?: string
}

export function FamilyConnection({
    startDate,
    endDate,
    className,
}: FamilyConnectionProps) {
    const isActive = !endDate

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-2 py-2",
                className
            )}
        >
            <div className="h-px flex-1 bg-border" />
            <div
                className={cn(
                    "size-8 rounded-full flex items-center justify-center",
                    "border-2 transition-colors",
                    isActive
                        ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                        : "bg-muted border-border text-muted-foreground"
                )}
            >
                <HeartIcon className="size-4" />
            </div>
            <div className="h-px flex-1 bg-border" />
        </div>
    )
}

interface ChildConnectionProps {
    className?: string
}

export function ChildConnection({ className }: ChildConnectionProps) {
    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="w-px h-6 bg-border" />
            <div className="w-4 h-4 border-l-2 border-b-2 border-border rounded-bl-lg" />
        </div>
    )
}

interface SiblingConnectionProps {
    count: number
    className?: string
}

export function SiblingConnection({ count, className }: SiblingConnectionProps) {
    if (count <= 1) return null

    return (
        <div className={cn("relative h-6 flex items-end justify-center", className)}>
            <div className="absolute top-0 left-1/2 w-px h-3 bg-border" />
            <div
                className="h-px bg-border"
                style={{ width: `${Math.min(count - 1, 4) * 60}px` }}
            />
        </div>
    )
}
