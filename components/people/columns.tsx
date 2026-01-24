"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useState } from "react"
import { deletePerson, PersonInput } from "@/lib/actions/person"
import { toast } from "sonner"
import { EditPersonDialog } from "@/components/family-tree/edit-person-dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Define shape of our data (must match what we fetch)
export type PersonColumn = {
    id: string
    name: string
    gender: "MALE" | "FEMALE" | "OTHER" | null
    dateOfBirth: Date | null
    placeOfBirth: string | null
    dateOfDeath: Date | null
    placeOfDeath: string | null
    bio: string | null
    photoUrl: string | null
    parents: string[] // formatted string of parents
    partners: string[] // formatted string of partners
    fatherId: string | null
    motherId: string | null
    spouseId: string | null
}

const ActionCell = ({ person }: { person: PersonColumn }) => {
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    // Convert column data back to input format for form
    const personData: any = {
        ...person
    }

    const handleDelete = async () => {
        const res = await deletePerson(person.id)
        if (res.error) {
            toast.error("Gagal menghapus data")
        } else {
            toast.success("Data berhasil dihapus")
            setDeleteOpen(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditPersonDialog
                person={personData}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data {person.name} akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export const columns: ColumnDef<PersonColumn>[] = [
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => {
            const isDeceased = !!row.original.dateOfDeath
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("name")}</span>
                    {isDeceased && <span className="text-xs text-muted-foreground">(Alm.)</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "gender",
        header: "L/P",
        cell: ({ row }) => {
            const g = row.getValue("gender")
            if (!g) return "-"
            const color = g === "MALE" ? "bg-blue-500/20 text-blue-500" : g === "FEMALE" ? "bg-pink-500/20 text-pink-500" : ""
            return <Badge variant="secondary" className={color}>{g === "MALE" ? "L" : g === "FEMALE" ? "P" : "?"}</Badge>
        },
    },
    {
        accessorKey: "dateOfBirth",
        header: "TTL",
        cell: ({ row }) => {
            const date = row.getValue("dateOfBirth") as Date
            const place = row.original.placeOfBirth
            if (!date && !place) return "-"
            return (
                <div className="text-xs">
                    <div>{place}</div>
                    <div>{date ? format(date, "d MMM yyyy", { locale: id }) : ""}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "parents",
        header: "Orang Tua",
        cell: ({ row }) => {
            const parents = row.original.parents
            return (
                <div className="text-xs space-y-0.5">
                    {parents.length > 0 ? parents.map((p, i) => <div key={i}>{p}</div>) : "-"}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell person={row.original} />,
    },
]
