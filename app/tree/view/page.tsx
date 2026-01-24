import Link from "next/link"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { TreesIcon, ArrowLeftIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
        <div className="flex items-center justify-center h-full">
            <Skeleton className="w-[80%] h-[80%] rounded-xl" />
        </div>
    )
}

async function TreeViewContent() {
    const { persons, families } = await getTreeData()

    if (persons.length === 0) {
        return (
            <Card className="glass-strong max-w-lg mx-auto mt-20">
                <CardContent className="p-8 text-center space-y-4">
                    <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full h-full relative">
            <StaticTree
                persons={JSON.parse(JSON.stringify(persons))}
                families={JSON.parse(JSON.stringify(families))}
                readOnly={true}
            />
        </div>
    )
}

export default function TreeViewPage() {
    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header - Read Only */}
            <header className="flex-none z-40 glass border-b px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild title="Back">
                        <Link href="/">
                            <ArrowLeftIcon className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <TreesIcon className="size-5 text-primary" />
                        <span className="font-semibold">Tree Visualization (Read Only)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/tree">
                            <PencilIcon className="size-4 mr-2" />
                            Switch to Edit Mode
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden">
                <Suspense fallback={<TreeSkeleton />}>
                    <TreeViewContent />
                </Suspense>
            </main>
        </div>
    )
}
