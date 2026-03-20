/*
import { CalculatorClient } from "@/components/family-tree/calculator-client"
import { prisma } from "@/lib/prisma"
import { unstable_noStore } from "next/cache"
*/

import Link from "next/link"
import { ArrowLeftIcon, HeartIcon, ConstructionIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/*
async function getData() {
    unstable_noStore()
    const allPeople = await prisma.person.findMany({
        // ... existing select logic ...
    })
    // ... mapping logic ...
}
*/

export default async function CalculatorPage() {
    // const people = await getData()

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

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center space-y-4">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                    <ConstructionIcon className="size-10" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Segera Hadir</h1>
                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                    Fitur kalkulator silsilah dan cek hubungan keluarga sedang dalam tahap pengembangan.
                </p>
                <Button variant="outline" asChild className="mt-8 rounded-full">
                    <Link href="/">
                        Kembali ke Beranda
                    </Link>
                </Button>
            </main>
        </div>
    )
}
