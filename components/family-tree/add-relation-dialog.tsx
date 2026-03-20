"use client"

import * as React from "react"
import { UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PersonForm } from "./person-form"

interface AddRelationDialogProps {
    personId: string
    personName: string
    personGender?: string | null // Need gender to determine Father/Mother role
    currentFamilyId?: string
    trigger?: React.ReactNode
    onSuccess?: () => void
    defaultRelation?: "SPOUSE" | "CHILD" | "PARENT"
}

export function AddRelationDialog({
    personId,
    personName,
    personGender,
    trigger,
    onSuccess,
    defaultRelation = "CHILD",
}: AddRelationDialogProps) {
    const [open, setOpen] = React.useState(false)

    // Construct default values for PersonForm based on relation
    const getDefaultValues = () => {
        const defaults: any = {}

        if (defaultRelation === "CHILD") {
            // If adding child, current person is a parent.
            if (personGender === "MALE") defaults.fatherId = personId
            else if (personGender === "FEMALE") defaults.motherId = personId
        } else if (defaultRelation === "SPOUSE") {
            defaults.spouseId = personId
        }
        // For Parent, we would set the NEW person's child as personId, but PersonForm adds NEW person.
        // So we can't easily set "childId" in PersonForm unless we add that field.
        // MVP: Skip Parent for now or handle it via a different flow?
        // Actually, createPerson logic could handle it if we passed "childId".
        // But let's stick to Spouse/Child for now.

        return defaults
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <UserPlusIcon className="size-4 mr-2" />
                        Tambah Relasi
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="sm:text-left">
                    <DialogTitle className="text-xl sm:text-2xl">
                        {defaultRelation === "SPOUSE" && `Tambah Pasangan untuk ${personName}`}
                        {defaultRelation === "CHILD" && `Tambah Anak untuk ${personName}`}
                        {defaultRelation === "PARENT" && `Tambah Orang Tua untuk ${personName}`}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Lengkapi data anggota keluarga baru di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <PersonForm
                    defaultValues={getDefaultValues()}
                    onSuccess={() => {
                        setOpen(false)
                        onSuccess?.()
                    }}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
