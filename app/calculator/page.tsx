import Link from "next/link"
import { ArrowLeftIcon, HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalculatorClient } from "@/components/family-tree/calculator-client"

// Types
type PersonSimple = {
    id: string,
    name: string,
    gender?: string | null,
    fatherId?: string | null,
    motherId?: string | null,
    spouseIds?: string[]
}

// Stats fetcher
import { prisma } from "@/lib/prisma"

async function getData() {
    const allPeople = await prisma.person.findMany({
        select: {
            id: true,
            name: true,
            gender: true,
            originFamily: {
                select: {
                    partners: {
                        select: {
                            person: {
                                select: {
                                    id: true,
                                    gender: true
                                }
                            }
                        }
                    }
                }
            },
            partnerships: {
                select: {
                    family: {
                        select: {
                            partners: {
                                select: {
                                    personId: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    return allPeople.map(p => {
        const potentialParents = p.originFamily?.partners?.map(part => part.person) || []
        const father = potentialParents.find(pp => pp.gender === "MALE")?.id
        const mother = potentialParents.find(pp => pp.gender === "FEMALE")?.id

        // Extract spouse IDs from all families they are part of
        const spouseIds = p.partnerships.flatMap(part =>
            part.family.partners
                .filter(fp => fp.personId !== p.id)
                .map(fp => fp.personId)
        )

        return {
            id: p.id,
            name: p.name,
            gender: p.gender,
            fatherId: father,
            motherId: mother,
            spouseIds: Array.from(new Set(spouseIds))
        }
    })
}

export default async function CalculatorPage() {
    const people = await getData()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="flex-none z-40 glass border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" asChild title="Back">
                        <Link href="/">
                            <ArrowLeftIcon className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <HeartIcon className="size-5 text-primary" />
                        <span className="font-semibold text-lg">Cek Hubungan</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8">
                <CalculatorClient people={people} />
            </main>
        </div>
    )
}
