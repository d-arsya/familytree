export type RelationshipResult = {
    relation: string
    path: string[]
    commonAncestorName?: string
}

export function calculateRelationship(
    data: { id: string, name: string, gender?: string | null, fatherId?: string | null, motherId?: string | null, spouseIds?: string[] }[],
    personAId: string,
    personBId: string
): RelationshipResult | null {

    if (personAId === personBId) return { relation: "Diri Sendiri", path: [personAId] }

    const personMap = new Map(data.map(p => [p.id, p]))

    // Check for Spouse relationship first (Direct)
    const personA = personMap.get(personAId)
    if (personA?.spouseIds?.includes(personBId)) {
        const personB = personMap.get(personBId)
        if (personB?.gender === "FEMALE") return { relation: "Istri", path: [personAId, personBId] }
        if (personB?.gender === "MALE") return { relation: "Suami", path: [personAId, personBId] }
        return { relation: "Pasangan", path: [personAId, personBId] }
    }

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
            if (totalDist < minTotalDist) {
                minTotalDist = totalDist
                commonAncestorId = id
            }
        }
    }

    if (!commonAncestorId) return null

    const distA = ancestorsA.get(commonAncestorId)!
    const distB = ancestorsB.get(commonAncestorId)!
    const commonName = personMap.get(commonAncestorId)?.name

    let relation = ""
    if (distA === 0) {
        if (distB === 1) relation = "Orang Tua (Ayah/Ibu)"
        else if (distB === 2) relation = "Kakek/Nenek"
        else if (distB === 3) relation = "Buyut"
        else relation = `Leluhur (${distB} generasi)`
    } else if (distB === 0) {
        if (distA === 1) relation = "Anak"
        else if (distA === 2) relation = "Cucu"
        else if (distA === 3) relation = "Cicit"
        else relation = `Keturunan (${distA} generasi)`
    } else if (distA === 1 && distB === 1) {
        relation = "Saudara Kandung"
    } else if (distA === 2 && distB === 1) {
        relation = "Keponakan"
    } else if (distA === 1 && distB === 2) {
        const target = personMap.get(personBId)
        if (target?.gender === "FEMALE") relation = "Bibi (Tante/Bude)"
        else relation = "Paman (Om/Pakde)"
    } else if (distA === 2 && distB === 2) {
        relation = "Sepupu"
    } else if (distA === 3 && distB === 3) {
        relation = "Sepupu Dua Kali (Misan)"
    } else {
        relation = `Kerabat (Jarak: ${distA} naik, ${distB} turun)`
    }

    return {
        relation,
        path: [],
        commonAncestorName: commonName
    }
}
