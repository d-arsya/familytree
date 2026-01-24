export const dynamic = "force-dynamic"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeftIcon, BarChart3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatisticsCharts } from "@/components/statistics/statistics-charts"

async function getStatistics() {
    const persons = await prisma.person.findMany({
        select: {
            id: true,
            name: true,
            gender: true,
            dateOfBirth: true,
            dateOfDeath: true,
            placeOfBirth: true,
            createdAt: true,
        },
    })

    const totalPersons = persons.length
    const livingCount = persons.filter(p => !p.dateOfDeath).length
    const deceasedCount = persons.filter(p => p.dateOfDeath).length
    const totalMale = persons.filter(p => p.gender === "MALE").length
    const totalFemale = persons.filter(p => p.gender === "FEMALE").length

    // Age Calculations
    const currentYear = new Date().getFullYear()
    const ages = persons
        .filter(p => p.dateOfBirth && !p.dateOfDeath) // Living only for current age
        .map(p => {
            if (!p.dateOfBirth) return 0
            return currentYear - new Date(p.dateOfBirth).getFullYear()
        })

    // Average Age (Living)
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0

    // Top 5 Oldest
    const oldestLiving = persons
        .filter(p => p.dateOfBirth && !p.dateOfDeath)
        .sort((a, b) => new Date(a.dateOfBirth!).getTime() - new Date(b.dateOfBirth!).getTime())
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            age: currentYear - new Date(p.dateOfBirth!).getFullYear(),
            photo: (p as any).photoUrl // if needed
        }))

    return {
        totalPersons,
        livingDeceased: [
            { name: "Hidup", value: livingCount, fill: "#10b981" }, // Emerald
            { name: "Wafat", value: deceasedCount, fill: "#64748b" }, // Slate
        ],
        genderDistribution: [
            { name: "Laki-laki", value: totalMale, fill: "#3b82f6" }, // Blue
            { name: "Perempuan", value: totalFemale, fill: "#ec4899" }, // Pink
        ],
        avgAge,
        oldestLiving
    }
}

export default async function StatisticsPage() {
    const stats = await getStatistics()

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
                        <BarChart3Icon className="size-5 text-primary" />
                        <span className="font-semibold text-lg">Statistik Keluarga</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Anggota</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPersons}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Usia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgAge} <span className="text-xs font-normal text-muted-foreground">tahun</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Laki-laki</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.genderDistribution[0].value}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Perempuan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-500">{stats.genderDistribution[1].value}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid md:grid-cols-2 gap-8">
                    <StatisticsCharts
                        genderData={stats.genderDistribution}
                        statusData={stats.livingDeceased}
                    />

                    {/* Oldest Living List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sesepuh Keluarga</CardTitle>
                            <CardDescription>Anggota keluarga tertua yang masih hidup</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.oldestLiving.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                {i + 1}
                                            </div>
                                            <span className="font-medium">{p.name}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{p.age} tahun</span>
                                    </div>
                                ))}
                                {stats.oldestLiving.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Belum ada data tanggal lahir yang lengkap.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
