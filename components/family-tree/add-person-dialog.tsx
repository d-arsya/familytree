"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

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

interface AddPersonDialogProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function AddPersonDialog({ trigger, onSuccess }: AddPersonDialogProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <PlusIcon className="size-4 mr-2" />
                        Tambah Anggota
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Anggota Keluarga</DialogTitle>
                    <DialogDescription>
                        Masukkan informasi dasar untuk anggota keluarga baru.
                    </DialogDescription>
                </DialogHeader>
                <PersonForm
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
