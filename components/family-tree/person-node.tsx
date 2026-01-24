"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react"
import { format } from "date-fns"

type Gender = "MALE" | "FEMALE" | "OTHER" | null

interface PersonNodeProps {
    id: string
    name: string
    gender?: Gender
    dateOfBirth?: Date | string | null
    dateOfDeath?: Date | string | null
    photoUrl?: string | null
    placeOfBirth?: string | null
    isSelected?: boolean
    onClick?: () => void
    className?: string
}

export function PersonNode({
    id,
    name,
    gender,
    dateOfBirth,
    dateOfDeath,
    photoUrl,
    placeOfBirth,
    isSelected = false,
    onClick,
    className,
}: PersonNodeProps) {
    const isDeceased = !!dateOfDeath

    const genderColor = {
        MALE: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        FEMALE: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        OTHER: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    }

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return ""
        try {
            const dateObj = typeof date === "string" ? new Date(date) : date
            return format(dateObj, "d MMM yyyy")
        } catch {
            return ""
        }
    }

    return (
        <Card
            onClick={onClick}
            className={cn(
                "w-48 cursor-pointer transition-all duration-200 hover:scale-105",
                "glass border-border/50 hover:border-primary/50",
                isSelected && "ring-2 ring-primary border-primary",
                isDeceased && "opacity-75",
                className
            )}
        >
            <CardContent className="pt-4 pb-3 px-3 space-y-2">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "size-12 rounded-full flex items-center justify-center flex-shrink-0",
                            "bg-muted border border-border",
                            photoUrl ? "overflow-hidden" : ""
                        )}
                    >
                        {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={photoUrl}
                                alt={name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <UserIcon className="size-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{name}</h3>
                        {gender && (
                            <Badge
                                variant="outline"
                                className={cn("text-xs mt-1", genderColor[gender])}
                            >
                                {gender === "MALE" ? "♂ Pria" : gender === "FEMALE" ? "♀ Wanita" : "⚥"}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {dateOfBirth && (
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="size-3" />
                            <span>
                                {formatDate(dateOfBirth)}
                                {dateOfDeath && ` – ${formatDate(dateOfDeath)}`}
                            </span>
                        </div>
                    )}
                    {placeOfBirth && (
                        <div className="flex items-center gap-1.5">
                            <MapPinIcon className="size-3" />
                            <span className="truncate">{placeOfBirth}</span>
                        </div>
                    )}
                </div>

                {isDeceased && (
                    <Badge variant="secondary" className="text-xs w-full justify-center">
                        Almarhum/ah
                    </Badge>
                )}
            </CardContent>
        </Card>
    )
}
