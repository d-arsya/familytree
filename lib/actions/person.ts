"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ============================================
// Schemas
// ============================================

const personSchema = z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
    dateOfBirth: z.coerce.date().optional().nullable(),
    dateOfDeath: z.coerce.date().optional().nullable(),
    placeOfBirth: z.string().optional().nullable(),
    placeOfDeath: z.string().optional().nullable(),
    photoUrl: z.string().optional().nullable(),
    originFamilyId: z.string().optional().nullable(),
    // Relations
    fatherId: z.string().optional(),
    motherId: z.string().optional(),
    spouseId: z.string().optional(),
})

export type PersonInput = z.infer<typeof personSchema>

// ============================================
// Actions
// ============================================

/**
 * Create a new person with optional relationships
 */
export async function createPerson(data: PersonInput) {
    // Separate relations from core person data
    const { fatherId, motherId, spouseId, ...personData } = data

    const parsed = personSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    try {
        // 1. Create Person
        const person = await prisma.person.create({
            data: {
                name: personData.name,
                gender: personData.gender,
                bio: personData.bio,
                dateOfBirth: personData.dateOfBirth,
                dateOfDeath: personData.dateOfDeath,
                placeOfBirth: personData.placeOfBirth,
                placeOfDeath: personData.placeOfDeath,
                photoUrl: personData.photoUrl || null,
            },
        })

        // 2. Handle Parents (Origin Family)
        if (fatherId || motherId) {
            let familyId = null

            // Try to find existing family with these parents
            if (fatherId && motherId) {
                const fathersFamilies = await prisma.partnership.findMany({
                    where: { personId: fatherId },
                    select: { familyId: true }
                })
                const mothersFamilies = await prisma.partnership.findMany({
                    where: { personId: motherId },
                    select: { familyId: true }
                })

                // Intersection
                const common = fathersFamilies.find(f =>
                    mothersFamilies.some(m => m.familyId === f.familyId)
                )
                if (common) familyId = common.familyId
            }

            // If still no family, check individual (single parent)
            if (!familyId && fatherId) {
                const f = await prisma.partnership.findFirst({ where: { personId: fatherId }, select: { familyId: true } })
                if (f) familyId = f.familyId
            }
            if (!familyId && motherId) {
                const m = await prisma.partnership.findFirst({ where: { personId: motherId }, select: { familyId: true } })
                if (m) familyId = m.familyId
            }

            // Create new family if needed
            if (!familyId) {
                const partnersToCreate = []
                if (fatherId) partnersToCreate.push({ personId: fatherId, role: "HUSBAND" as const })
                if (motherId) partnersToCreate.push({ personId: motherId, role: "WIFE" as const })

                if (partnersToCreate.length > 0) {
                    const newFam = await prisma.family.create({
                        data: {
                            partners: { create: partnersToCreate }
                        }
                    })
                    familyId = newFam.id
                }
            }

            // Link child to family
            if (familyId) {
                await prisma.person.update({
                    where: { id: person.id },
                    data: { originFamilyId: familyId }
                })
            }
        }

        // 3. Handle Spouse
        if (spouseId) {
            await prisma.family.create({
                data: {
                    partners: {
                        create: [
                            { personId: person.id, role: "PARTNER" }, // Simplification
                            { personId: spouseId, role: "PARTNER" }
                        ]
                    }
                }
            })
        }

        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath("/people")
        return { data: person }
    } catch (error) {
        console.error("Failed to create person:", error)
        return { error: "Failed to create person" }
    }
}

/**
 * Update an existing person
 */
export async function updatePerson(id: string, data: Partial<PersonInput>) {
    const { fatherId, motherId, spouseId, ...personData } = data

    const parsed = personSchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    try {
        // 1. Update basic data
        const person = await prisma.person.update({
            where: { id },
            data: {
                name: personData.name,
                gender: personData.gender,
                bio: personData.bio,
                dateOfBirth: personData.dateOfBirth,
                dateOfDeath: personData.dateOfDeath,
                placeOfBirth: personData.placeOfBirth,
                placeOfDeath: personData.placeOfDeath,
                photoUrl: personData.photoUrl,
            },
        })

        // 2. Handle Parent Changes
        if (fatherId !== undefined || motherId !== undefined) {
            // Find current parent IDs if only one is provided
            let finalFatherId = fatherId
            let finalMotherId = motherId

            if (fatherId === undefined || motherId === undefined) {
                const current = await prisma.person.findUnique({
                    where: { id },
                    include: {
                        originFamily: {
                            include: { partners: true }
                        }
                    }
                })

                if (current?.originFamily) {
                    if (fatherId === undefined) {
                        finalFatherId = current.originFamily.partners.find(p => p.role === "HUSBAND")?.personId || undefined
                    }
                    if (motherId === undefined) {
                        finalMotherId = current.originFamily.partners.find(p => p.role === "WIFE")?.personId || undefined
                    }
                }
            }

            if (finalFatherId || finalMotherId) {
                let familyId = null

                // Try intersection
                if (finalFatherId && finalMotherId) {
                    const fFams = await prisma.partnership.findMany({ where: { personId: finalFatherId }, select: { familyId: true } })
                    const mFams = await prisma.partnership.findMany({ where: { personId: finalMotherId }, select: { familyId: true } })
                    const common = fFams.find(f => mFams.some(m => m.familyId === f.familyId))
                    if (common) familyId = common.familyId
                }

                if (!familyId && finalFatherId) {
                    const f = await prisma.partnership.findFirst({ where: { personId: finalFatherId }, select: { familyId: true } })
                    if (f) familyId = f.familyId
                }

                if (!familyId && finalMotherId) {
                    const m = await prisma.partnership.findFirst({ where: { personId: finalMotherId }, select: { familyId: true } })
                    if (m) familyId = m.familyId
                }

                if (!familyId) {
                    const partners = []
                    if (finalFatherId) partners.push({ personId: finalFatherId, role: "HUSBAND" as const })
                    if (finalMotherId) partners.push({ personId: finalMotherId, role: "WIFE" as const })
                    const newFam = await prisma.family.create({ data: { partners: { create: partners } } })
                    familyId = newFam.id
                }

                await prisma.person.update({
                    where: { id },
                    data: { originFamilyId: familyId }
                })
            }
        }

        // 3. Handle Spouse Changes (Simple Add if not exists)
        if (spouseId) {
            const existing = await prisma.partnership.findFirst({
                where: {
                    personId: id,
                    family: {
                        partners: { some: { personId: spouseId } }
                    }
                }
            })

            if (!existing) {
                await prisma.family.create({
                    data: {
                        partners: {
                            create: [
                                { personId: id, role: "PARTNER" },
                                { personId: spouseId, role: "PARTNER" }
                            ]
                        }
                    }
                })
            }
        }

        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath(`/person/${id}`)
        revalidatePath("/people")
        return { data: person }
    } catch (error) {
        console.error("Failed to update person:", error)
        return { error: "Failed to update person" }
    }
}

/**
 * Delete a person
 */
export async function deletePerson(id: string) {
    try {
        await prisma.person.delete({
            where: { id },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete person:", error)
        return { error: "Failed to delete person" }
    }
}

/**
 * Get a single person by ID with related data
 */
export async function getPerson(id: string) {
    try {
        const person = await prisma.person.findUnique({
            where: { id },
            include: {
                originFamily: {
                    include: {
                        partners: {
                            include: {
                                person: true,
                            },
                        },
                        children: true,
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
                media: true,
                events: {
                    orderBy: { date: "asc" },
                },
            },
        })
        return { data: person }
    } catch (error) {
        console.error("Failed to get person:", error)
        return { error: "Failed to get person" }
    }
}

/**
 * Get all persons (for tree visualization)
 */
export async function getAllPersons() {
    try {
        const persons = await prisma.person.findMany({
            include: {
                originFamily: true,
                partnerships: {
                    include: {
                        family: {
                            include: {
                                children: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: "asc" },
        })
        return { data: persons }
    } catch (error) {
        console.error("Failed to get persons:", error)
        return { error: "Failed to get persons" }
    }
}

/**
 * Get all persons (for tree visualization)
 */
export async function getPeopleList() {
    // Return more data for filtering (Gender, DOB)
    const people = await prisma.person.findMany({
        select: {
            id: true,
            name: true,
            gender: true,
            dateOfBirth: true
        },
        orderBy: { name: "asc" }
    })
    // Serialize dates for client
    return people.map(p => ({
        ...p,
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString() : null
    }))
}

/**
 * Get ancestors of a person using recursive approach
 * Since SQLite doesn't support CTEs well in Prisma, we use iterative approach
 */
export async function getAncestors(personId: string, maxDepth: number = 10) {
    const ancestors: Array<{
        person: Awaited<ReturnType<typeof prisma.person.findUnique>>
        depth: number
        relation: string
    }> = []

    async function fetchAncestors(
        currentPersonId: string,
        depth: number,
        relation: string
    ) {
        if (depth > maxDepth) return

        const person = await prisma.person.findUnique({
            where: { id: currentPersonId },
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
            },
        })

        if (!person?.originFamily) return

        // Get parents from origin family
        for (const partnership of person.originFamily.partners) {
            const parent = partnership.person
            ancestors.push({
                person: parent,
                depth,
                relation: relation || (partnership.role === "WIFE" ? "Mother" : "Father"),
            })

            // Recursively get grandparents
            await fetchAncestors(
                parent.id,
                depth + 1,
                depth === 1 ? `Grand${partnership.role === "WIFE" ? "mother" : "father"}` : `Great-${relation}`
            )
        }
    }

    await fetchAncestors(personId, 1, "")
    return { data: ancestors }
}

/**
 * Get descendants of a person using recursive approach
 */
export async function getDescendants(personId: string, maxDepth: number = 10) {
    const descendants: Array<{
        person: Awaited<ReturnType<typeof prisma.person.findUnique>>
        depth: number
        relation: string
    }> = []

    async function fetchDescendants(
        currentPersonId: string,
        depth: number,
        relation: string
    ) {
        if (depth > maxDepth) return

        // Get all families where this person is a partner
        const partnerships = await prisma.partnership.findMany({
            where: { personId: currentPersonId },
            include: {
                family: {
                    include: {
                        children: true,
                    },
                },
            },
        })

        for (const partnership of partnerships) {
            for (const child of partnership.family.children) {
                const childPerson = await prisma.person.findUnique({
                    where: { id: child.id },
                })

                descendants.push({
                    person: childPerson,
                    depth,
                    relation: relation || (depth === 1 ? "Child" : "Grandchild"),
                })

                // Recursively get grandchildren
                await fetchDescendants(
                    child.id,
                    depth + 1,
                    depth === 1 ? "Grandchild" : `Great-${relation}`
                )
            }
        }
    }

    await fetchDescendants(personId, 1, "")
    return { data: descendants }
}
