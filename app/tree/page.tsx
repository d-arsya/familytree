import Link from "next/link"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { TreesIcon, ArrowLeftIcon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AddPersonDialog } from "@/components/family-tree/add-person-dialog"
import { StaticTree } from "@/components/family-tree/static-tree"

async function getTreeData() {
    const persons = await prisma.person.findMany({
        include: {
            originFamily: {
                include: {
                    partners: {
                        include: {
                            person: true,
                        },
                    },
                },
            },
            partnerships: {
                include: {
                    family: {
                        include: {
                            children: true,
                            partners: {
                                include: {
                                    person: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    })

    const families = await prisma.family.findMany({
        include: {
            partners: {
                include: {
                    person: true,
                },
            },
            children: true,
        },
    })

    return { persons, families }
}

function TreeSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="glass">
                    <CardContent className="pt-4 pb-3 px-3 space-y-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

async function TreeContent() {
    const { persons, families } = await getTreeData()

    if (persons.length === 0) {
        return (
            <Card className="glass-strong max-w-lg mx-auto">
                <CardContent className="p-8 text-center space-y-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <UsersIcon className="size-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Belum Ada Anggota Keluarga</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Mulai dengan menambahkan anggota keluarga pertama ke pohon Anda.
                        </p>
                    </div>
                    <AddPersonDialog />
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full h-full relative">
            {/* Tree Visualization (Static) */}
            <div className="absolute inset-0 w-full h-full">
                <StaticTree
                    persons={JSON.parse(JSON.stringify(persons))}
                    families={JSON.parse(JSON.stringify(families))}
                />
            </div>
        </div>
    )
}

export default function TreePage() {
    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header - Interactive */}
            <header className="flex-none z-40 glass border-b px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild title="Back">
                        <Link href="/">
                            <ArrowLeftIcon className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <TreesIcon className="size-5 text-primary" />
                        <span className="font-semibold">Interactive Tree</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/tree/view">
                            <UsersIcon className="size-4 mr-2" />
                            View Only Mode
                        </Link>
                    </Button>
                    <AddPersonDialog />
                </div>
            </header>

            {/* Main Content - Full */}
            <main className="flex-1 relative overflow-hidden">
                <Suspense fallback={<TreeSkeleton />}>
                    <TreeContent />
                </Suspense>
            </main>
        </div>
    )
}
