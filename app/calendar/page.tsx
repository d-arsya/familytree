export const dynamic = "force-dynamic"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeftIcon, CalendarIcon, CakeIcon, Flower2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getCalendarEvents() {
    const persons = await prisma.person.findMany({
        select: {
            id: true,
            name: true,
            dateOfBirth: true,
            dateOfDeath: true,
            gender: true,
            photoUrl: true,
        },
    })

    const events: any[] = []
    const currentYear = new Date().getFullYear()

    persons.forEach(p => {
        // Birthday Events
        if (p.dateOfBirth) {
            const dob = new Date(p.dateOfBirth)
            if (!p.dateOfDeath) { // Only birthdays for living? Or remembrance for deceased too? Usually birthdays for living.
                events.push({
                    id: p.id,
                    personName: p.name,
                    type: "BIRTHDAY",
                    date: dob,
                    displayDate: new Date(currentYear, dob.getMonth(), dob.getDate()), // Normalized to current year for sorting
                    age: currentYear - dob.getFullYear(),
                    photoUrl: p.photoUrl
                })
            }
        }

        // Death Anniversary (Haul) Events
        if (p.dateOfDeath) {
            const dod = new Date(p.dateOfDeath)
            events.push({
                id: p.id,
                personName: p.name,
                type: "HAUL",
                date: dod,
                displayDate: new Date(currentYear, dod.getMonth(), dod.getDate()),
                yearsSince: currentYear - dod.getFullYear(),
                photoUrl: p.photoUrl
            })
        }
    })

    // Sort by Display Date (Jan -> Dec)
    events.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime())

    // Group by Month
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const groupedEvents = months.map((monthName, index) => {
        const monthEvents = events.filter(e => e.displayDate.getMonth() === index)
        return {
            month: monthName,
            events: monthEvents,
            isCurrentMonth: index === new Date().getMonth()
        }
    }).filter(g => g.events.length > 0)

    // Re-order to start from CURRENT MONTH? Or just Jan-Dec?
    // User usually wants to see UPCOMING first.
    // Let's keep Jan-Dec for structure, but Highlight Current Month.

    return groupedEvents
}

export default async function CalendarPage() {
    const groups = await getCalendarEvents()

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
                        <CalendarIcon className="size-5 text-primary" />
                        <span className="font-semibold text-lg">Family Calendar</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 max-w-3xl">
                {groups.length === 0 ? (
                    <div className="text-center space-y-4 py-20 text-muted-foreground">
                        <CalendarIcon className="size-16 mx-auto opacity-20" />
                        <p>No birth or death dates recorded yet.</p>
                        <Button variant="outline" asChild>
                            <Link href="/tree">Add Data to Tree</Link>
                        </Button>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.month} className={`space-y-4 ${group.isCurrentMonth ? 'bg-primary/5 -mx-4 p-4 rounded-xl border border-primary/10' : ''}`}>
                            <div className="flex items-center gap-4">
                                <h3 className={`text-xl font-bold font-serif ${group.isCurrentMonth ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {group.month}
                                </h3>
                                {group.isCurrentMonth && <Badge variant="default">Bulan Ini</Badge>}
                                <div className="h-px bg-border flex-1" />
                            </div>

                            <div className="grid gap-3">
                                {group.events.map((event: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
                                        {/* Date Box */}
                                        <div className="flex flex-col items-center justify-center size-14 bg-muted/50 rounded-lg border text-center">
                                            <span className="text-xs text-muted-foreground uppercase font-semibold">
                                                Tgl
                                            </span>
                                            <span className="text-xl font-bold font-mono">
                                                {event.displayDate.getDate()}
                                            </span>
                                        </div>

                                        {/* Avatar */}
                                        <div className="size-10 rounded-full bg-muted/30 overflow-hidden flex-none">
                                            {event.photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={event.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted text-xs font-bold text-muted-foreground">
                                                    {event.personName.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{event.personName}</p>
                                                {event.type === 'BIRTHDAY' && <CakeIcon className="size-4 text-pink-500" />}
                                                {event.type === 'HAUL' && <Flower2Icon className="size-4 text-purple-500" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {event.type === 'BIRTHDAY'
                                                    ? `${event.age}th Birthday`
                                                    : `Remembrance: ${event.yearsSince} years since passing`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    )
}
