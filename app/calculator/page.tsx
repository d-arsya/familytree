import Link from "next/link"
import { ArrowLeftIcon, HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalculatorClient } from "@/components/family-tree/calculator-client"
import { prisma } from "@/lib/prisma"

async function getData() {
    const persons = await prisma.person.findMany({
        select: {
            id: true,
            name: true,
            originFamily: {
                select: {
                    partners: {
                        select: {
                            personId: true,
                            role: true,
                        }
                    }
                }
            }
        }
    })

    return persons.map(p => {
        const parents = p.originFamily?.partners || []
        const father = parents.find(par => par.role === "HUSBAND")?.personId
        const mother = parents.find(par => par.role === "WIFE")?.personId
        return {
            id: p.id,
            name: p.name,
            fatherId: father,
            motherId: mother,
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
