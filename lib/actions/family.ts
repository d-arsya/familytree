"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ============================================
// Schemas
// ============================================

const familySchema = z.object({
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    notes: z.string().optional().nullable(),
})

export type FamilyInput = z.infer<typeof familySchema>

const partnershipSchema = z.object({
    personId: z.string(),
    familyId: z.string(),
    role: z.enum(["HUSBAND", "WIFE", "PARTNER"]),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
})

// ============================================
// Actions
// ============================================

/**
 * Create a new family unit
 */
export async function createFamily(data: FamilyInput) {
    const parsed = familySchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    try {
        const family = await prisma.family.create({
            data: parsed.data,
        })
        revalidatePath("/")
        revalidatePath("/tree")
        return { data: family }
    } catch (error) {
        console.error("Failed to create family:", error)
        return { error: "Failed to create family" }
    }
}

/**
 * Update an existing family
 */
export async function updateFamily(id: string, data: Partial<FamilyInput>) {
    const parsed = familySchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    try {
        const family = await prisma.family.update({
            where: { id },
            data: parsed.data,
        })
        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath(`/family/${id}`)
        return { data: family }
    } catch (error) {
        console.error("Failed to update family:", error)
        return { error: "Failed to update family" }
    }
}

/**
 * Delete a family
 */
export async function deleteFamily(id: string) {
    try {
        // First remove all children's originFamilyId references
        await prisma.person.updateMany({
            where: { originFamilyId: id },
            data: { originFamilyId: null },
        })

        // Then delete the family (cascades to partnerships)
        await prisma.family.delete({
            where: { id },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete family:", error)
        return { error: "Failed to delete family" }
    }
}

/**
 * Get a single family by ID with related data
 */
export async function getFamily(id: string) {
    try {
        const family = await prisma.family.findUnique({
            where: { id },
            include: {
                partners: {
                    include: {
                        person: true,
                    },
                },
                children: true,
            },
        })
        return { data: family }
    } catch (error) {
        console.error("Failed to get family:", error)
        return { error: "Failed to get family" }
    }
}

/**
 * Get all families
 */
export async function getAllFamilies() {
    try {
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
        return { data: families }
    } catch (error) {
        console.error("Failed to get families:", error)
        return { error: "Failed to get families" }
    }
}

/**
 * Add a partner to a family
 */
export async function addPartner(
    familyId: string,
    personId: string,
    role: "HUSBAND" | "WIFE" | "PARTNER"
) {
    const parsed = partnershipSchema.safeParse({ familyId, personId, role })
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    try {
        const partnership = await prisma.partnership.create({
            data: {
                familyId,
                personId,
                role,
            },
            include: {
                person: true,
                family: true,
            },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath(`/family/${familyId}`)
        revalidatePath(`/person/${personId}`)
        return { data: partnership }
    } catch (error) {
        console.error("Failed to add partner:", error)
        return { error: "Failed to add partner" }
    }
}

/**
 * Remove a partner from a family
 */
export async function removePartner(familyId: string, personId: string) {
    try {
        await prisma.partnership.delete({
            where: {
                personId_familyId: {
                    personId,
                    familyId,
                },
            },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath(`/family/${familyId}`)
        revalidatePath(`/person/${personId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to remove partner:", error)
        return { error: "Failed to remove partner" }
    }
}

/**
 * Add a child to a family
 */
export async function addChild(familyId: string, personId: string) {
    try {
        const person = await prisma.person.update({
            where: { id: personId },
            data: { originFamilyId: familyId },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath(`/family/${familyId}`)
        revalidatePath(`/person/${personId}`)
        return { data: person }
    } catch (error) {
        console.error("Failed to add child:", error)
        return { error: "Failed to add child" }
    }
}

/**
 * Remove a child from a family (set originFamilyId to null)
 */
export async function removeChild(personId: string) {
    try {
        const person = await prisma.person.update({
            where: { id: personId },
            data: { originFamilyId: null },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        revalidatePath(`/person/${personId}`)
        return { data: person }
    } catch (error) {
        console.error("Failed to remove child:", error)
        return { error: "Failed to remove child" }
    }
}

/**
 * Create a family with partners in one transaction
 */
export async function createFamilyWithPartners(
    familyData: FamilyInput,
    partners: Array<{ personId: string; role: "HUSBAND" | "WIFE" | "PARTNER" }>
) {
    const parsed = familySchema.safeParse(familyData)
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    try {
        const family = await prisma.family.create({
            data: {
                ...parsed.data,
                partners: {
                    create: partners.map((p) => ({
                        personId: p.personId,
                        role: p.role,
                    })),
                },
            },
            include: {
                partners: {
                    include: {
                        person: true,
                    },
                },
            },
        })
        revalidatePath("/")
        revalidatePath("/tree")
        return { data: family }
    } catch (error) {
        console.error("Failed to create family with partners:", error)
        return { error: "Failed to create family with partners" }
    }
}
