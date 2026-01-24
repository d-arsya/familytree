export const dynamic = "force-dynamic"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeftIcon, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

async function getGalleryPhotos() {
    // For now, aggregate all profile photos
    const persons = await prisma.person.findMany({
        where: {
            photoUrl: {
                not: "",
            }
        },
        select: {
            id: true,
            name: true,
            photoUrl: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Filter out nulls strictly if not handled by query
    return persons.filter(p => p.photoUrl && p.photoUrl.length > 0)
}

export default async function GalleryPage() {
    const photos = await getGalleryPhotos()

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
                        <ImageIcon className="size-5 text-primary" />
                        <span className="font-semibold text-lg">Galeri Keluarga</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-6">
                <div className="bg-muted/30 border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <ImageIcon className="size-4" />
                        </div>
                        <p>
                            Foto diambil secara otomatis dari profil anggota keluarga.
                            Untuk menambahkan foto, buka <strong>Editor Pohon</strong>, pilih anggota keluarga, klik <strong>Edit</strong>, dan unggah foto profil.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/tree/editor">Buka Editor Pohon</Link>
                    </Button>
                </div>

                {photos.length === 0 ? (
                    <div className="text-center space-y-4 py-20 text-muted-foreground">
                        <ImageIcon className="size-16 mx-auto opacity-20" />
                        <p>Belum ada foto anggota keluarga.</p>
                        <Button variant="outline" asChild>
                            <Link href="/tree/editor">Tambah Foto di Editor</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {photos.map((person) => (
                            <div key={person.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={person.photoUrl!}
                                    alt={person.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <p className="text-white font-medium text-sm truncate w-full">
                                        {person.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
