export const dynamic = "force-dynamic"
import Link from "next/link"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { TreesIcon, ArrowLeftIcon, GalleryHorizontalEndIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
                        <h3 className="text-lg font-semibold">Belum Ada Data</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Silakan tambahkan data melalui halaman utama.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/tree">Kembali ke Editor</Link>
                    </Button>
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

export default function HorizontalTreePage() {
    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header - Glassmorphism & Responsive */}
            <header className="flex-none z-40 glass border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" asChild title="Back">
                        <Link href="/tree">
                            <ArrowLeftIcon className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <GalleryHorizontalEndIcon className="size-5 text-primary" />
                        <span className="font-semibold text-sm md:text-base hidden sm:inline-block">Horizontal View</span>
                        <span className="font-semibold text-sm md:text-base sm:hidden">Horizontal</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden">
                <Suspense fallback={<TreeSkeleton />}>
                    <TreeContent />
                </Suspense>
            </main>
        </div>
    )
}

// Helper icon for empty state
import { UsersIcon } from "lucide-react"
