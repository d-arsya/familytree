export type RelationshipResult = {
    relation: string
    path: string[]
    commonAncestorName?: string
}

export function calculateRelationship(
    data: { id: string, name: string, fatherId?: string | null, motherId?: string | null }[],
    personAId: string,
    personBId: string
): RelationshipResult | null {

    if (personAId === personBId) return { relation: "Diri Sendiri", path: [personAId] }

    const personMap = new Map(data.map(p => [p.id, p]))

    // Helper to get ancestors path: [Self, Parent, Grandparent, ...]
    const getAncestors = (startId: string): string[] => {
        const path: string[] = []
        let current: string | undefined = startId
        const visited = new Set<string>()

        // BFS queue: { id, path }
        // Simple ancestry: just trace parents. But we have 2 parents.
        // We need to find ALL ancestors.

        // Let's perform BFS to find all ancestors with distances
        // Returns Map<AncestorId, Distance>
        return []
    }

    // Better approach: Get Ancestors Set for A and B. Find Intersection.
    // Pick Intersection with MAX Distance (Oldest) or MIN Distance?
    // LCA is the ancestor with the smallest sum of distances, or closest to generation.

    // 1. Build Ancestry Graph (Upwards)
    const getAncestorsMap = (startId: string) => {
        const ancestors = new Map<string, number>() // ID -> Steps Up
        const queue: { id: string, steps: number }[] = [{ id: startId, steps: 0 }]
        const visited = new Set<string>([startId])

        while (queue.length > 0) {
            const { id, steps } = queue.shift()!
            ancestors.set(id, steps)

            const p = personMap.get(id)
            if (!p) continue

            if (p.fatherId && !visited.has(p.fatherId)) {
                visited.add(p.fatherId)
                queue.push({ id: p.fatherId, steps: steps + 1 })
            }
            if (p.motherId && !visited.has(p.motherId)) {
                visited.add(p.motherId)
                queue.push({ id: p.motherId, steps: steps + 1 })
            }
        }
        return ancestors
    }

    const ancestorsA = getAncestorsMap(personAId)
    const ancestorsB = getAncestorsMap(personBId)

    // Find Common Ancestors
    let commonAncestorId: string | null = null
    let minTotalDist = Infinity

    for (const [id, stepsA] of ancestorsA) {
        if (ancestorsB.has(id)) {
            const stepsB = ancestorsB.get(id)!
            const totalDist = stepsA + stepsB
            // Prefer CLOSEST common ancestor (Lowest one in tree) -> Minimum steps
            if (totalDist < minTotalDist) {
                minTotalDist = totalDist
                commonAncestorId = id
            }
        }
    }

    // Check Spousal relationship directly?
    // (Not implemented in ancestry logic, handled separately if needed, but "Suami/Istri" isn't strictly lineage)

    if (!commonAncestorId) return null

    const distA = ancestorsA.get(commonAncestorId)!
    const distB = ancestorsB.get(commonAncestorId)!

    const commonName = personMap.get(commonAncestorId)?.name

    // Determine Term
    let relation = ""

    // Logic based on Indonesian kinship terms
    if (distA === 0) {
        // A is the ancestor
        if (distB === 1) relation = "Orang Tua (Ayah/Ibu)"
        else if (distB === 2) relation = "Kakek/Nenek"
        else if (distB === 3) relation = "Buyut"
        else relation = `Leluhur (${distB} generasi)`
    } else if (distB === 0) {
        // B is the ancestor
        if (distA === 1) relation = "Anak"
        else if (distA === 2) relation = "Cucu"
        else if (distA === 3) relation = "Cicit"
        else relation = `Keturunan (${distA} generasi)`
    } else if (distA === 1 && distB === 1) {
        relation = "Saudara Kandung"
    } else if (distA === 1 && distB === 2) {
        relation = "Keponakan"
    } else if (distA === 2 && distB === 1) {
        relation = "Paman/Bibi (Pakde/Bude/Om/Tante)"
    } else if (distA === 2 && distB === 2) {
        relation = "Sepupu (Sepupu Sekali)"
    } else if (distA === 3 && distB === 3) {
        relation = "Sepupu Dua Kali (Misan)"
    } else {
        relation = `Kerabat Jauh (Jarak: ${distA} naik, ${distB} turun)`
    }

    return {
        relation,
        path: [], // Simple result for MVP
        commonAncestorName: commonName
    }
}
