"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PersonForm } from "./person-form"
import { PersonInput } from "@/lib/actions/person"

interface EditPersonDialogProps {
    person: (PersonInput & { id: string }) | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditPersonDialog({ person, open, onOpenChange }: EditPersonDialogProps) {
    if (!person) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="sm:text-left">
                    <DialogTitle className="text-xl sm:text-2xl">Edit Data Orang</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Ubah informasi detail untuk {person.name}.
                    </DialogDescription>
                </DialogHeader>
                <PersonForm
                    defaultValues={person}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
