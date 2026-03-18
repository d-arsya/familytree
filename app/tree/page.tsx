export const dynamic = "force-dynamic"
import Link from "next/link"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { TreesIcon, ArrowLeftIcon, GalleryHorizontalEndIcon, UsersIcon } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AddPersonDialog } from "@/components/family-tree/add-person-dialog"
import { HorizontalTree } from "@/components/family-tree/horizontal-tree"

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
        <div className="w-full h-full flex items-center justify-center bg-muted/10">
            <div className="text-center space-y-4">
                <GalleryHorizontalEndIcon className="size-16 text-muted-foreground/20 mx-auto animate-pulse" />
                <p className="text-muted-foreground animate-pulse">Memuat Peta Horizontal...</p>
            </div>
        </div>
    )
}

async function TreeContent() {
    const { persons, families } = await getTreeData()

    if (persons.length === 0) {
        return (
            <Card className="glass-strong max-w-lg mx-auto mt-20">
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
            <div className="absolute inset-0 w-full h-full">
                <HorizontalTree
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
            {/* Header - Interactive & Responsive */}
            <header className="flex-none z-40 glass border-b px-3 sm:px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="icon" asChild title="Back">
                        <Link href="/">
                            <ArrowLeftIcon className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <GalleryHorizontalEndIcon className="size-5 text-primary" />
                        <span className="font-semibold text-sm sm:text-base hidden sm:inline-block">Silsilah Keluarga</span>
                        <span className="font-semibold text-sm sm:hidden">Silsilah</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <ThemeToggle />
                    <Button variant="outline" size="sm" asChild className="px-2 sm:px-3">
                        <Link href="/tree/editor">
                            <TreesIcon className="size-4 sm:mr-2" />
                            <span className="hidden sm:inline">Editor</span>
                        </Link>
                    </Button>
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
