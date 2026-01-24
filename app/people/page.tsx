import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeftIcon, PlusIcon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { DataTable } from "@/components/people/data-table"
import { columns, PersonColumn } from "@/components/people/columns"
import { AddPersonDialog } from "@/components/family-tree/add-person-dialog"

async function getPeopleData(): Promise<PersonColumn[]> {
    const persons = await prisma.person.findMany({
        include: {
            originFamily: {
                include: {
                    partners: {
                        include: {
                            person: true
                        }
                    }
                }
            },
            partnerships: {
                include: {
                    family: {
                        include: {
                            partners: {
                                include: {
                                    person: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { name: "asc" }
    })

    return persons.map(p => {
        // Find parents
        const parentsList = p.originFamily?.partners.map(part => part.person.name) || []
        const fatherId = p.originFamily?.partners.find(part => part.role === "HUSBAND")?.personId || undefined
        const motherId = p.originFamily?.partners.find(part => part.role === "WIFE")?.personId || undefined

        // Find partners
        const partnerNames = p.partnerships.flatMap(part =>
            part.family.partners
                .filter(fp => fp.personId !== p.id)
                .map(fp => fp.person.name)
        )
        const spouseId = p.partnerships[0]?.family.partners.find(fp => fp.personId !== p.id)?.personId || undefined

        return {
            id: p.id,
            name: p.name,
            gender: p.gender,
            dateOfBirth: p.dateOfBirth,
            placeOfBirth: p.placeOfBirth,
            dateOfDeath: p.dateOfDeath,
            placeOfDeath: p.placeOfDeath,
            bio: p.bio,
            photoUrl: p.photoUrl,
            parents: parentsList,
            partners: partnerNames,
            fatherId: fatherId || null,
            motherId: motherId || null,
            spouseId: spouseId || null
        }
    })
}

export default async function PeoplePage() {
    const data = await getPeopleData()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeftIcon className="size-5" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <UsersIcon className="size-6 text-primary" />
                            <span className="font-semibold text-lg">Manajemen Data</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <AddPersonDialog trigger={
                            <Button>
                                <PlusIcon className="mr-2 size-4" />
                                Tambah Orang
                            </Button>
                        } />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <DataTable columns={columns} data={data} />
            </main>
        </div>
    )
}
