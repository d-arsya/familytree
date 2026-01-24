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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Data Orang</DialogTitle>
                    <DialogDescription>
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
