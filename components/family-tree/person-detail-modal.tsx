"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon, UserIcon, CalendarIcon, MapPinIcon, PencilIcon, HeartIcon, BabyIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddRelationDialog } from "./add-relation-dialog"

type Gender = "MALE" | "FEMALE" | "OTHER" | null

interface PersonData {
    id: string
    name: string
    bio?: string | null
    gender?: Gender
    dateOfBirth?: Date | null
    dateOfDeath?: Date | null
    placeOfBirth?: string | null
    placeOfDeath?: string | null
    photoUrl?: string | null
}

interface PersonDetailModalProps {
    person: PersonData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (personId: string) => void
    readOnly?: boolean
}

export function PersonDetailModal({
    person,
    open,
    onOpenChange,
    onEdit,
    readOnly = false,
}: PersonDetailModalProps) {
    const formatDate = (date: Date | null) => {
        if (!date) return "-"
        return format(date, "d MMMM yyyy", { locale: id })
    }

    if (!person) return null

    const isDeceased = !!person.dateOfDeath

    const genderLabel = {
        MALE: "Laki-laki",
        FEMALE: "Perempuan",
        OTHER: "Lainnya",
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cn(
                        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    )}
                />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
                        "w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto", // Responsive width
                        "rounded-xl border bg-card shadow-2xl",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    )}
                >
                    {/* Header with photo */}
                    <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                        {person.photoUrl && (
                            <div className="absolute inset-0 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={person.photoUrl}
                                    alt=""
                                    className="w-full h-full object-cover opacity-30"
                                />
                            </div>
                        )}
                        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                            <XIcon className="size-4" />
                        </DialogPrimitive.Close>
                    </div>

                    {/* Avatar */}
                    <div className="relative px-6 -mt-12">
                        <div
                            className={cn(
                                "size-24 rounded-full border-4 border-card",
                                "bg-muted flex items-center justify-center overflow-hidden"
                            )}
                        >
                            {person.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={person.photoUrl}
                                    alt={person.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <UserIcon className="size-10 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">{person.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {person.gender && (
                                        <Badge variant="outline" className="text-xs">
                                            {genderLabel[person.gender]}
                                        </Badge>
                                    )}
                                    {isDeceased && (
                                        <Badge variant="secondary" className="text-xs">
                                            Almarhum/ah
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {onEdit && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onEdit(person.id)}
                                    className="self-end sm:self-auto w-full sm:w-auto"
                                >
                                    <PencilIcon className="size-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                        </div>

                        {person.bio && (
                            <p className="text-muted-foreground text-sm">{person.bio}</p>
                        )}

                        <div className="space-y-3 pt-2">
                            {person.dateOfBirth && (
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="size-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Tanggal Lahir</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(new Date(person.dateOfBirth))}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {person.dateOfDeath && (
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="size-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Tanggal Wafat</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(new Date(person.dateOfDeath))}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {person.placeOfBirth && (
                                <div className="flex items-start gap-3">
                                    <MapPinIcon className="size-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Alamat</p>
                                        <p className="text-sm text-muted-foreground">
                                            {person.placeOfBirth}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Relations Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pasangan</h4>
                                <div className="space-y-1">
                                    {(person as any).partnerships?.length > 0 ? (
                                        (person as any).partnerships.map((part: any, i: number) => {
                                            const spouse = part.family.partners.find((fp: any) => fp.personId !== person.id)?.person
                                            return spouse ? (
                                                <p key={i} className="text-sm font-medium">{spouse.name}</p>
                                            ) : null
                                        })
                                    ) : (
                                        <p className="text-sm text-muted-foreground">-</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anak-anak</h4>
                                <div className="space-y-3">
                                    {(person as any).partnerships?.length > 0 ? (
                                        (person as any).partnerships.map((part: any, i: number) => {
                                            if (part.family.children.length === 0) return null
                                            const otherParent = part.family.partners.find((fp: any) => fp.personId !== person.id)?.person
                                            return (
                                                <div key={i} className="space-y-1">
                                                    {(person as any).partnerships.length > 1 && (
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Deng {otherParent?.name || '?'}</p>
                                                    )}
                                                    {part.family.children.map((child: any, ci: number) => (
                                                        <p key={ci} className="text-sm font-medium">{child.name}</p>
                                                    ))}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="text-sm text-muted-foreground">-</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Relationship Actions - Hidden in Read Only mode */}
                        {!readOnly && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                                <AddRelationDialog
                                    personId={person.id}
                                    personName={person.name}
                                    personGender={person.gender}
                                    defaultRelation="SPOUSE"
                                    trigger={
                                        <Button variant="outline" size="sm" className="flex-1 font-normal">
                                            <HeartIcon className="size-3 mr-2 text-pink-500" />
                                            Pasangan
                                        </Button>
                                    }
                                    onSuccess={() => onOpenChange(false)}
                                />
                                <AddRelationDialog
                                    personId={person.id}
                                    personName={person.name}
                                    personGender={person.gender}
                                    defaultRelation="CHILD"
                                    trigger={
                                        <Button variant="outline" size="sm" className="flex-1 font-normal">
                                            <BabyIcon className="size-3 mr-2 text-blue-500" />
                                            Anak
                                        </Button>
                                    }
                                    onSuccess={() => onOpenChange(false)}
                                />
                            </div>
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
